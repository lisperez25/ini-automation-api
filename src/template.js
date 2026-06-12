function renderTemplate(templateText, data) {
  return templateText.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
    return data[key] !== undefined && data[key] !== null ? String(data[key]) : "";
  });
}

module.exports = {
  renderTemplate
};
