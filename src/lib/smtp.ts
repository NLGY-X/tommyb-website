import net from "node:net";
import tls from "node:tls";
import { randomBytes } from "node:crypto";

/*
 * Just enough SMTP to hand one plain-text email to a mail provider:
 * implicit TLS (port 465) or STARTTLS (587), AUTH PLAIN, one recipient.
 * Written here rather than adding a mail library for a single notification.
 */

export interface SmtpConfig {
  host: string;
  port: number;
  /** true for implicit TLS (465). Otherwise STARTTLS is used when offered. */
  secure: boolean;
  user?: string;
  pass?: string;
  /** Test hook: allow a plain connection with no TLS at all. */
  allowInsecure?: boolean;
}

export interface MailMessage {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}

/** Reads SMTP_* env vars. Null when SMTP isn't set up, which means "just store it". */
export function smtpFromEnv(env: Record<string, string | undefined>): SmtpConfig | null {
  if (!env.SMTP_HOST) {
    return null;
  }
  const port = Number(env.SMTP_PORT || 587);
  return {
    host: env.SMTP_HOST,
    port,
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465,
    user: env.SMTP_USER || undefined,
    pass: env.SMTP_PASS || undefined,
  };
}

function encodeHeader(value: string): string {
  const clean = value.replace(/[\r\n]+/g, " ");
  return /^[\x20-\x7e]*$/.test(clean)
    ? clean
    : `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

function address(value: string): string {
  const clean = value.replace(/[\r\n<>]/g, "");
  return clean;
}

export function buildMessage(msg: MailMessage, now = new Date()): string {
  const domain = address(msg.from).split("@")[1] || "localhost";
  const body = Buffer.from(msg.text.replace(/\r?\n/g, "\r\n"), "utf8")
    .toString("base64")
    .replace(/.{1,76}/g, "$&\r\n");
  const headers = [
    `From: ${address(msg.from)}`,
    `To: ${address(msg.to)}`,
    ...(msg.replyTo ? [`Reply-To: ${address(msg.replyTo)}`] : []),
    `Subject: ${encodeHeader(msg.subject)}`,
    `Date: ${now.toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${randomBytes(12).toString("hex")}@${domain}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
  ];
  return `${headers.join("\r\n")}\r\n\r\n${body}`;
}

class Conversation {
  private buffer = "";
  private waiting: ((line: string) => void) | null = null;
  private failure: Error | null = null;
  socket: net.Socket;

  constructor(socket: net.Socket) {
    this.socket = socket;
    this.attach(socket);
  }

  attach(socket: net.Socket) {
    this.socket = socket;
    socket.setEncoding("utf8");
    socket.on("data", (chunk: string) => {
      this.buffer += chunk;
      this.flush();
    });
    socket.on("error", (error) => {
      this.failure = error;
      this.flush();
    });
  }

  private flush() {
    if (!this.waiting) return;
    if (this.failure) {
      const done = this.waiting;
      this.waiting = null;
      done(`ERR ${this.failure.message}`);
      return;
    }
    /* A reply is complete at a line whose 4th character is a space: "250 OK". */
    const lines = this.buffer.split("\r\n");
    for (let i = 0; i < lines.length - 1; i++) {
      if (/^\d{3}( |$)/.test(lines[i])) {
        const reply = lines.slice(0, i + 1).join("\n");
        this.buffer = lines.slice(i + 1).join("\r\n");
        const done = this.waiting;
        this.waiting = null;
        done(reply);
        return;
      }
    }
  }

  read(): Promise<string> {
    return new Promise((resolve) => {
      this.waiting = resolve;
      this.flush();
    });
  }

  async expect(codes: number[], command?: string): Promise<string> {
    if (command !== undefined) {
      this.socket.write(`${command}\r\n`);
    }
    const reply = await this.read();
    const code = Number(reply.slice(0, 3));
    if (!codes.includes(code)) {
      const shown = command?.startsWith("AUTH") ? "AUTH" : command ?? "greeting";
      throw new Error(`SMTP ${shown} failed: ${reply.split("\n").pop()}`);
    }
    return reply;
  }
}

function connect(config: SmtpConfig): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = config.secure
      ? tls.connect({ host: config.host, port: config.port, servername: config.host }, () => resolve(socket))
      : net.connect({ host: config.host, port: config.port }, () => resolve(socket));
    socket.once("error", reject);
  });
}

function upgrade(socket: net.Socket, host: string): Promise<tls.TLSSocket> {
  return new Promise((resolve, reject) => {
    const secure = tls.connect({ socket, servername: host }, () => resolve(secure));
    secure.once("error", reject);
  });
}

export async function sendMail(config: SmtpConfig, msg: MailMessage, timeoutMs = 15_000): Promise<void> {
  const socket = await connect(config);
  const timer = setTimeout(() => socket.destroy(new Error("SMTP timed out")), timeoutMs);
  const chat = new Conversation(socket);
  try {
    await chat.expect([220]);
    let ehlo = await chat.expect([250], "EHLO tommybmusic.co.uk");
    if (!config.secure) {
      if (/STARTTLS/i.test(ehlo)) {
        await chat.expect([220], "STARTTLS");
        socket.removeAllListeners("data");
        const secured = await upgrade(socket, config.host);
        chat.attach(secured);
        ehlo = await chat.expect([250], "EHLO tommybmusic.co.uk");
      } else if (!config.allowInsecure) {
        throw new Error("SMTP server does not offer STARTTLS; refusing to send the password in the clear");
      }
    }
    if (config.user) {
      const token = Buffer.from(`\0${config.user}\0${config.pass ?? ""}`, "utf8").toString("base64");
      await chat.expect([235], `AUTH PLAIN ${token}`);
    }
    await chat.expect([250], `MAIL FROM:<${address(msg.from)}>`);
    await chat.expect([250, 251], `RCPT TO:<${address(msg.to)}>`);
    await chat.expect([354], "DATA");
    /* Dot-stuffing: a line starting with "." gets a second one. */
    const data = buildMessage(msg).replace(/^\./gm, "..");
    await chat.expect([250], `${data}\r\n.`);
    await chat.expect([221], "QUIT").catch(() => "");
  } finally {
    clearTimeout(timer);
    chat.socket.end();
  }
}
