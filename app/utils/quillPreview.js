export const sanitizeQuillHTML = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;

  // Remove Quill UI spans
  div.querySelectorAll("span.ql-ui").forEach((span) => span.remove());

  // Convert Quill-style lists to actual lists
  const listItems = [...div.querySelectorAll("li[data-list]")];
  if (listItems.length > 0) {
    let parent;
    listItems.forEach((li) => {
      const type = li.getAttribute("data-list");

      // Create parent list if not present
      if (
        !parent ||
        parent.tagName.toLowerCase() !== (type === "ordered" ? "ol" : "ul")
      ) {
        parent = document.createElement(type === "ordered" ? "ol" : "ul");
        li.parentNode.insertBefore(parent, li);
      }

      parent.appendChild(li);
    });
  }

  // Replace empty list items
  listItems.forEach((li) => {
    if (li.textContent.trim() === "") {
      li.innerHTML = "(Empty Item)";
    }
  });

  return div.innerHTML;
};
