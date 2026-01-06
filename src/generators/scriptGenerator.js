const { GoogleGenerativeAI } = require("@google/generative-ai");
const ensureDir = require("../../utils/ensureDir");
const { PROMPT } = require("../../constant");
const path = require("path");
const fs = require("fs");

class ScriptGenerator {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generate() {
    const prompt = PROMPT;

    try {
      console.log("📝 Generating script...");
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up response - remove markdown code blocks if present
      text = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const scriptData = JSON.parse(text);
      const id = `${Date.now()}`;

      scriptData.id = id;
      scriptData.timestamp = new Date().toISOString();

      const scriptDir = path.join(process.cwd(), "public", "scripts");
      ensureDir(scriptDir);

      const scriptPath = path.join(scriptDir, `script_${id}.json`);
      fs.writeFileSync(scriptPath, JSON.stringify(scriptData, null, 2));

      console.log("✅ Script generated successfully!");

      return scriptData;
    } catch (error) {
      console.error("❌ Error generating script:", error);
      throw error;
    }
  }
}

module.exports = ScriptGenerator;
