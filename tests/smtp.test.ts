import { test } from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { buildMessage, sendMail, smtpFromEnv } from "../src/lib/smtp.ts";

/* A fake SMTP server that records the conversation. Plain TCP, no TLS. */
function fakeServer(): Promise<{ port: number; log: string[]; data: string[]; close: () => void }> {
  const log: string[] = [];
  const data: string[] = [];
  const server = net.createServer((socket) => {
    socket.setEncoding("utf8");
    let inData = false;
    let body = "";
    let buffer = "";
    socket.write("220 fake ESMTP\r\n");
    socket.on("data", (chunk: string) => {
      buffer += chunk;
      let index;
      while ((index = buffer.indexOf("\r\n")) >= 0) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        if (inData) {
          if (line === ".") {
            inData = false;
            data.push(body);
            socket.write("250 queued\r\n");
          } else {
            body += `${line}\r\n`;
          }
          continue;
        }
        log.push(line);
        if (line.startsWith("EHLO")) socket.write("250-fake\r\n250-AUTH PLAIN\r\n250 OK\r\n");
        else if (line.startsWith("AUTH PLAIN")) socket.write("235 ok\r\n");
        else if (line.startsWith("MAIL FROM")) socket.write("250 ok\r\n");
        else if (line.startsWith("RCPT TO")) socket.write("250 ok\r\n");
        else if (line === "DATA") {
          inData = true;
          socket.write("354 go\r\n");
        } else if (line === "QUIT") {
          socket.end("221 bye\r\n");
        } else socket.write("500 what\r\n");
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as net.AddressInfo).port;
      resolve({ port, log, data, close: () => server.close() });
    });
  });
}

test("sends one message through the SMTP conversation", async () => {
  const server = await fakeServer();
  await sendMail(
    { host: "127.0.0.1", port: server.port, secure: false, user: "u@mail.com", pass: "p", allowInsecure: true },
    { from: "u@mail.com", to: "tommybmusic@mail.com", replyTo: "promoter@club.com", subject: "Booking enquiry: Zoë", text: "Hello\n.dot line" },
  );
  server.close();
  assert.equal(server.log[0], "EHLO tommybmusic.co.uk");
  assert.equal(server.log[1], `AUTH PLAIN ${Buffer.from("\0u@mail.com\0p").toString("base64")}`);
  assert.equal(server.log[2], "MAIL FROM:<u@mail.com>");
  assert.equal(server.log[3], "RCPT TO:<tommybmusic@mail.com>");
  assert.equal(server.log[4], "DATA");
  assert.equal(server.log[5], "QUIT");
  const message = server.data[0];
  assert.match(message, /^From: u@mail\.com\r\n/);
  assert.match(message, /\r\nReply-To: promoter@club\.com\r\n/);
  assert.match(message, /\r\nSubject: =\?UTF-8\?B\?/);
  const body = message.split("\r\n\r\n")[1].replace(/\r\n/g, "");
  assert.equal(Buffer.from(body, "base64").toString("utf8"), "Hello\r\n.dot line");
});

test("refuses to send a password over a connection with no TLS", async () => {
  const server = await fakeServer();
  await assert.rejects(
    sendMail({ host: "127.0.0.1", port: server.port, secure: false, user: "u", pass: "p" }, {
      from: "u@mail.com",
      to: "t@mail.com",
      subject: "x",
      text: "x",
    }),
    /STARTTLS/,
  );
  server.close();
});

test("header injection is flattened", () => {
  const msg = buildMessage({ from: "a@b.com", to: "c@d.com", subject: "Hi\r\nBcc: x@y.com", text: "x" });
  assert.equal(/\r\nBcc:/.test(msg), false);
});

test("SMTP is off unless SMTP_HOST is set", () => {
  assert.equal(smtpFromEnv({}), null);
  assert.deepEqual(smtpFromEnv({ SMTP_HOST: "smtp.mail.com", SMTP_USER: "u", SMTP_PASS: "p" }), {
    host: "smtp.mail.com",
    port: 587,
    secure: false,
    user: "u",
    pass: "p",
  });
  assert.equal(smtpFromEnv({ SMTP_HOST: "h", SMTP_PORT: "465" })?.secure, true);
});
