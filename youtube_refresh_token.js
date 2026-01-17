const { google } = require("googleapis");
const readline = require("readline");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.YT_CLIENT_ID,
  process.env.YT_CLIENT_SECRET,
  // "urn:ietf:wg:oauth:2.0:oob"
  "http://127.0.0.1:3000"
);

const scopes = ["https://www.googleapis.com/auth/youtube.upload"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent",
});

console.log("Authorize this app by visiting:\n", authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the code here: ", async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log("\nREFRESH TOKEN:\n", tokens.refresh_token);
  rl.close();
});
