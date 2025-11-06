import { LocalServer } from "@/app/utils";
import ToastNotification from "./Toast";

export const getErrorMessage = (error) => {
  if (!error) return "The server is not responding";

  // Extract main error message (if present as a string)
  const mainMessage = typeof error.message === "string" ? error.message : "";

  // Extract validation messages (e.g., { email: ["The email has already been taken."] })
  const validationMessages = error?.message;

  let formattedValidationErrors = "";

  if (validationMessages && typeof validationMessages === "object") {
    formattedValidationErrors = Object.entries(validationMessages)
      .map(([field, messages]) => `${messages.join(", ")}`) // Join multiple messages for a field
      .join("; "); // Separate different field errors
  }

  // Ensure the returned value is always a string
  return (
    mainMessage || formattedValidationErrors || "The server is not responding."
  );
};

export const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

export const passwordRules =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;

export const DownloadDocument = async (api, name, type) => {
  const { ToastComponent } = ToastNotification;
  document.body.style.cursor = "wait";
  try {
    const res = await LocalServer.get(api);
    let encodedUri = encodeURI(res.data);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${name}.${type}`);
    document.body.appendChild(link);
    link.click();
    document.body.style.cursor = "default";
  } catch (err) {
    document.body.style.cursor = "default";
    console.error(`Error downloading ${type}:`, err);
    ToastComponent("error", `Could not download the ${type}.`);
  }
};

export const DownloadWordDocument = async (api, name, type) => {
  document.body.style.cursor = "wait";
  try {
    const res = await LocalServer.get(api);
    const { file_name, mime_type, base64 } = res.data;
    const byteCharacters = atob(base64);
    const byteArray = new Uint8Array(
      [...byteCharacters].map((c) => c.charCodeAt(0))
    );
    const blob = new Blob([byteArray], { type: mime_type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    document.body.style.cursor = "default";
  } catch (err) {
    document.body.style.cursor = "default";
    console.error(`Error downloading ${type}:`, err);
    ToastComponent("error", `Could not download the ${type}.`);
  }
};

export const cleanTemplateTags = (str) => {
  return str.replace(/\{\{([^}]+)\}\}/g, (_, inner) => {
    // Extract HTML tags inside {{...}}
    const tags = inner.match(/<[^>]+>/g) || [];
    // Remove all tags to isolate the variable content
    const variable = inner.replace(/<[^>]+>/g, "").trim();
    // Place tags *outside* of the {{variable}}
    return tags.length
      ? tags.join("") +
          "{{" +
          variable +
          "}}" +
          tags
            .map((t) => {
              // try to generate closing tags for any opening ones
              const tagMatch = t.match(/^<([a-zA-Z0-9]+)/);
              return tagMatch ? `</${tagMatch[1]}>` : "";
            })
            .reverse()
            .join("")
      : "{{" + variable + "}}";
  });
};
