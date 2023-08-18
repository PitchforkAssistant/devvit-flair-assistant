document.addEventListener("DOMContentLoaded", function () {
    addAnother();
    document.getElementById("addAnother").addEventListener("click", addAnother);
    document.getElementById("resetAll").addEventListener("click", resetAll);
    document.getElementById("copy").addEventListener("click", copy);
    document.getElementById("generateConfig").addEventListener("click", generateConfig);
    document.getElementById("closePlaceholderOverlay").addEventListener("click", closePlaceholderOverlay);
    document.getElementById("placeholderOverlay").addEventListener("click", function (e) {
        if (e.target.id == "placeholderOverlay") {
            closePlaceholderOverlay();
        }
    });
})

function copy() {
    // copy flairConfigOutput to clipboard
    const flairConfigOutput = document.getElementById("flairConfigOutput");
    flairConfigOutput.select();
    flairConfigOutput.setSelectionRange(0, 99999999);
    navigator.clipboard.writeText(flairConfigOutput.value);
}

function addAnother() {
    let baseConfig = document.getElementById("baseConfig");
    let clone = baseConfig.cloneNode(true);
    clone.id = "";
    baseConfig.parentElement.appendChild(clone);
    clone.querySelectorAll("input[type=checkbox][data-toggles]").forEach(function (changedElement) {
        changedElement.addEventListener("change", function () {
            console.log("changed");
            let show = changedElement.dataset.invertToggles ? !changedElement.checked : changedElement.checked;
            changedElement.parentElement.parentElement.querySelectorAll(`[name=${changedElement.dataset.toggles}]`).forEach(function (el) {
                el.disabled = !show;
                el.classList.toggle("disabled", !show);
                if (el.parentElement.tagName == "LABEL") {
                    el.parentElement.classList.toggle("disabled", !show);
                }
            });
            changedElement.parentElement.parentElement.querySelectorAll(`[for=${changedElement.dataset.toggles}]`).forEach(function (el) {
                el.classList.toggle("disabled", !show);
            });
        });
    });
    clone.querySelectorAll("button.delete").forEach(function (deleteButton) {
        deleteButton.addEventListener("click", function () {
            deleteButton.parentElement.remove();
        });
    });
    clone.querySelectorAll("svg.supportsPlaceholders").forEach(function (deleteButton) {
        deleteButton.addEventListener("click", openPlaceholderOverlay);
    });
}

function resetAll() {
    document.querySelectorAll(".flairConfig:not(#baseConfig)").forEach(function (el) {
        el.remove();
    });
    addAnother();
}

function openPlaceholderOverlay() {
    document.getElementById("placeholderOverlay").classList.remove("disabled");
    document.body.classList.add("noscroll");
}


function closePlaceholderOverlay() {
    document.getElementById("placeholderOverlay").classList.add("disabled");
    document.body.classList.remove("noscroll");
}

function generateConfig() {
    const allConfigs = [];
    const errors = [];
    const configElements = document.querySelectorAll(".flairConfig:not(#baseConfig)");
    configElements.forEach(function (configElement) {
        const config = {};

        const configIndex = Array.prototype.indexOf.call(configElement.parentElement.children, configElement);

        const templateId = configElement.querySelector("[name=flairTemplateId]").value;
        if (templateId) {
            config["templateId"] = templateId.toLowerCase().trim();
        } else {
            errors.push(`Config ${configIndex}: Missing template ID`);
            return;
        }


        const action = configElement.querySelector("[name=flairAction]").value;
        if (action != "none") {
            config["action"] = action;
        }

        const changeContributor = configElement.querySelector("[name=flairContributor]").value;
        if (changeContributor != "none") {
            config["contributor"] = changeContributor;
        }

        const clearFlair = configElement.querySelector("[name=flairClear]").checked;
        if (clearFlair) {
            config["clearPostFlair"] = true;
        }

        const lockPost = configElement.querySelector("[name=flairLock]").checked;
        if (lockPost) {
            config["lock"] = true;
        }

        const ignoreReports = configElement.querySelector("[name=flairIgnore]").checked;
        if (ignoreReports) {
            config["ignoreReports"] = true;
        }

        const flairBanToggle = configElement.querySelector("[name=flairBanToggle]").checked;
        if (flairBanToggle) {
            const ban = {};

            const permanentBan = configElement.querySelector("[name=flairBanPerma]").checked;
            if (!permanentBan) {
                const banDuration = configElement.querySelector("[name=flairBanDuration]").value;
                if (banDuration) {
                    ban["duration"] = parseInt(banDuration);
                } else {
                    errors.push(`Config ${configIndex}: Missing ban duration`);
                    return;
                }
            }

            const banMessage = configElement.querySelector("[name=flairBanMessage]").value;
            if (banMessage) {
                ban["message"] = banMessage;
            } else {
                errors.push(`Config ${configIndex}: Missing ban message`);
                return;
            }

            const banNote = configElement.querySelector("[name=flairBanNote]").value;
            if (banNote) {
                ban["note"] = banNote;
            } else {
                errors.push(`Config ${configIndex}: Missing ban note`);
                return;
            }

            const banReason = configElement.querySelector("[name=flairBanReason]").value;
            if (banReason) {
                ban["reason"] = banReason;
            } else {
                errors.push(`Config ${configIndex}: Missing ban reason`);
                return;
            }

            config["ban"] = ban;
        }

        const flairCommentToggle = configElement.querySelector("[name=flairCommentToggle]").checked;
        if (flairCommentToggle) {
            const comment = {};

            const commentBody = configElement.querySelector("[name=flairComment]").value;
            if (commentBody) {
                comment["body"] = commentBody;
            } else {
                errors.push(`Config ${configIndex}: Missing comment body`);
                return;
            }

            const commentDistinguish = configElement.querySelector("[name=flairCommentDistinguish]").checked;
            if (commentDistinguish) {
                comment["distinguish"] = true;

                const commentSticky = configElement.querySelector("[name=flairCommentSticky]").checked;
                if (commentSticky) {
                    comment["sticky"] = true;
                }
            }

            const commentHeaderFooter = configElement.querySelector("[name=flairCommentHeaderFooter]").checked;
            if (commentHeaderFooter) {
                comment["headerFooter"] = true;
            }

            const commentLock = configElement.querySelector("[name=flairCommentLock]").checked;
            if (commentLock) {
                comment["lock"] = true;
            }

            config["comment"] = comment;
        }

        const flairUserFlairToggle = configElement.querySelector("[name=flairUserFlairToggle]").checked;
        if (flairUserFlairToggle) {
            const userFlair = {};

            userFlair["text"] = configElement.querySelector("[name=flairUserFlairText]").value;
            userFlair["cssClass"] = configElement.querySelector("[name=flairUserFlairCSSClass]").value;
            userFlair["templateId"] = configElement.querySelector("[name=flairUserFlairTemplateId]").value;

            config["userFlair"] = userFlair;
        }

        // only add if there's at least two keys
        if (Object.keys(config).length > 1) {
            allConfigs.push(config);
        } else {
            errors.push(`Config ${configIndex}: Only has a template ID, does nothing`);
        }
    });

    const errorsElement = document.getElementById("flairConfigOutputError");
    const configOutputElement = document.getElementById("flairConfigOutput");
    if (errors.length) {
        errorsElement.classList.remove("disabled");
        configOutputElement.classList.add("invalid");
        errorsElement.innerHTML = "Some errors occured, the generated config may not be complete!<br>" + errors.join("<br>");
        return;
    } else {
        errorsElement.classList.add("disabled");
        configOutputElement.classList.remove("invalid");
        configOutputElement.value = JSON.stringify(allConfigs, null, 4);
    }
}