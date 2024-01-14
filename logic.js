function showToast(name) {
    const e_toast = document.getElementById(name);
    const i_toast = bootstrap.Toast.getOrCreateInstance(e_toast);
    i_toast.show();
}

function downloadFile(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    element.click();
}

function updateButtonHTML(HTML) {
    e_mainDiv.innerHTML = HTML;
    fitty('#btnTxt', {
        minSize: 12,
        maxSize: 100,
    });
}

function textToSpeech(message) {
    const synth = window.speechSynthesis;
    synth.cancel();

    let msg = new SpeechSynthesisUtterance();
    msg.text = message.replace(/[^\x00-\x7F]/g, "");

    synth.speak(msg);
}

function buttonToHTML(color, text, numOfButtons) {
    let colSize = 12;
    let padSize = '';
    let fontSize = 'ab';
    let btnHeight = (availBtnHeight / numOfButtons) * 0.85;

    if (numOfButtons > 4) {
        colSize = 6;
        btnHeight = (availBtnHeight / ((numOfButtons + numOfButtons % 2) / 2)) * 0.85;
        fontSize = 'ac';
    }

    if (numOfButtons > 8) {
        colSize = 4;
        if (numOfButtons % 3 === 0) {
            btnHeight = (availBtnHeight / (numOfButtons / 3)) * 0.85;
        } else {
            btnHeight = (availBtnHeight / ((numOfButtons + 3 - numOfButtons % 3) / 3)) * 0.85;
        }
    }
    if (window.innerWidth < 1000) {
        colSize = 12;
        btnHeight = (availBtnHeight / numOfButtons) * 0.85;
        fontSize = 'ac';
    }

    return '' +
        '<div class="col-' + colSize + ' p-2" style="height: ' + btnHeight + 'px">' +
        '<button type="button" class="btn btn-lg ' + color + '-btn w-100 h-100 ' + padSize + ' m-2 hb20 ' + fontSize + '" onclick="' +
        'textToSpeech(\'' + text.replace('\'', '\\\'') + '\');' +
        '"><a id="btnTxt">' + text + '</a>' +
        '</button>' +
        '</div>';
}

function updateMostRecentView(viewName) {
    mostRecentView = viewName;
}

class Controller {
    constructor() {
        this.viewStorage = [];
        this.setViewStorageToDefault();
    }

    // Looks up View Name in viewStorage & returns HTML
    fromViewNameGetInnerHTML(viewName) {
        let matched = false, matchedView, matchedName, buttonHTML = '';
        let vs = JSON.parse(JSON.stringify(this.viewStorage));

        for (const element of vs) {
            if (element[0] === viewName) {
                matched = true;
                matchedView = element;
            }
        }

        if (!matched) {
            return '<p>Internal error: Could not find view: ' + viewName + '</p>';
        }

        if (matchedView instanceof Array) {
            matchedName = matchedView.shift();
        } else {
            return '<p>Internal error: matchedView not instanceof Array</p>';
        }

        if (!matchedView instanceof Array) {
            return '<p>Internal error: matchedView not instanceof Array, post matchedView.shift()</p>';
        }

        if (matchedView.length < 1) {
            return '<div class="d-flex justify-content-center">' +
                '<h6 class="ali pt-4">This view is empty! Add buttons with "Edit Current View"</h6>' +
                '</div>';
        }

        let numOfButtons = matchedView.length;

        for (const element of matchedView) {
            let color = element[0];
            let text = element[1];
            buttonHTML = buttonHTML + buttonToHTML(color, text, numOfButtons);
        }

        return buttonHTML;
    }

    // Returns true if view name exists
    viewNameAlreadyExists(viewName) {
        if (this.viewStorage.length < 1) {
            console.warn('The storage array is empty.');
            return;
        }

        let matched = false;

        for (const element of this.viewStorage) {
            if (element[0].toLowerCase() === viewName.toLowerCase()) {
                matched = true;
            }
        }

        return matched;
    }

    getIndexOfView(viewName) {
        if (this.viewStorage.length < 1) {
            console.warn('The storage array is empty.');
            return;
        }

        if(!this.viewNameAlreadyExists(viewName)) {
            console.warn('The view ' + viewName + ' failed index lookup because it does not exist.');
            return false;
        }

        let i = 0;
        for (const view of this.viewStorage) {
            if (view[0] === viewName) {
                return i;
            }
            i++;
        }

        console.warn('The view ' + viewName + ' failed index lookup because of a system error.');
        return false;
    }

    // Adds trimmed name to viewStorage
    addNewView(viewName) {
        this.viewStorage.push([viewName.toString().trim()]);
    }

    // Deletes an existing view
    deleteView(viewName) {
        if (this.viewStorage.length < 1) {
            console.warn('The view ' + viewName + ' could not be deleted because the storage array is empty.');
            return;
        }
        console.log('Trying to delete view: ' + viewName);

        let index = this.getIndexOfView(viewName);
        if(index === false) {
            console.warn('The view ' + viewName + ' could not be deleted because index lookup failed.');
            return;
        }

        let removed = this.viewStorage.pop();
        console.warn('removed', removed);
        console.warn(this.viewStorage);
    }

    // Refresh HTML for Switch View Modal
    refreshSwitchViewModal() {
        updateButtonHTML('');

        let outputHTML = '';

        let i = 0;
        for (const view of this.viewStorage) {
            let viewName = view[0];
            let numOfBtnsStr = view.length - 1;
            let showToggle = '';
            if (i === 0)
                showToggle = ' show';

            if (numOfBtnsStr === 1) {
                numOfBtnsStr += ' Button';
            } else {
                numOfBtnsStr += ' Buttons';
            }

            outputHTML += '' +
                '<div class="accordion-item">' +
                '<h2 class="accordion-header">' +
                '<button class="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-2-' + (i + 1) + '">' +
                '<span class="d-inline-block specific-w-150 text-truncate">' +
                viewName +
                '</span>' +
                '<span class="badge text-bg-dark font-monospace mx-2">' +
                numOfBtnsStr +
                '</span>' +
                '</button>' +
                '</h2>' +
                '<div id="collapse-2-' + (i + 1) + '" class="accordion-collapse collapse' + showToggle + '" data-bs-parent="#m_switchView_e_accordion">' +
                '<div class="accordion-body">' +
                '<div class="d-grid gap-2 d-md-flex justify-content-md-between">' +
                '<button type="button" class="btn btn-primary" onclick="' +
                'updateButtonHTML(controller.fromViewNameGetInnerHTML(\'' + viewName + '\'));' +
                'm_switchView_b_close.click();' +
                'updateMostRecentView(\'' + viewName + '\');' +
                '">Open View</button>' +
                '<button type="button" class="btn btn-danger" onclick="' +
                'controller.deleteView(\'' + viewName + '\');'+
                '">Delete View</button>' +
                '</div></div></div></div>';

            i++;
        }

        m_switchView_e_accordion.innerHTML = outputHTML;
    }

    // Refresh HTML for Edit Current View Modal
    refreshEditCurrentViewModal() {

        let outputCode = '', sectionCode = '', viewName = '', titleCopied = false, foundCurrentView = false, viewIndex, viewIteration = 0;

        for (const view of this.viewStorage) {
            if (view[0] === mostRecentView) {
                foundCurrentView = true;
                viewIndex = viewIteration;

                let buttonIndex = 0;
                for (const element of view) {

                    if(titleCopied) {
                        let color = element[0];
                        let text = element[1];

                        let red = '', orange = '', yellow = '', green = '', blue = '', pink = '', purple = '', teal = '', other = '';
                        switch (color) {
                            case 'red':
                                red = 'selected';
                                break;
                            case 'orange':
                                orange = 'selected';
                                break;
                            case 'yellow':
                                yellow = 'selected';
                                break;
                            case 'green':
                                green = 'selected';
                                break;
                            case 'blue':
                                blue = 'selected';
                                break;
                            case 'pink':
                                pink = 'selected';
                                break;
                            case 'purple':
                                purple = 'selected';
                                break;
                            case 'teal':
                                teal = 'selected';
                                break;
                            default:
                                other = 'selected';
                        }

                        sectionCode += '' +
                            '<div class="input-group input-group-lg my-2" id="m_editCurrentView_e_inputGroup' + buttonIndex + '">' +
                            '<label class="input-group-text" id="m_editCurrentView_e_inputGroup' + buttonIndex + '_e_label">' + buttonIndex + '. </label>' +
                            '<input type="text" class="form-control" placeholder="Button text" aria-label="Button text" ' +
                            'id="ecvti' + buttonIndex + '" ' +
                            'oninput="controller.editViewUpdateButtonText(' + viewIndex + ', ' + buttonIndex + ')" ' +
                            'value="' + text + '">' +

                            '<span class="input-group-text"> - </span>' +

                            '<select class="form-select" aria-label="Button color" ' +
                            'id="ecvcs' + buttonIndex + '" ' +
                            'onchange="controller.editViewUpdateButtonColor(' + viewIndex + ', ' + buttonIndex + ');"' +
                            '>' +

                            '<option value="" ' + other + ' disabled>Choose color</option>' +
                            '<option value="red" ' + red + '>Red</option>' +
                            '<option value="orange" ' + orange + '>Orange</option>' +
                            '<option value="yellow" ' + yellow + '>Yellow</option>' +
                            '<option value="green" ' + green + '>Green</option>' +
                            '<option value="teal" ' + teal + '>Teal</option>' +
                            '<option value="blue" ' + blue + '>Blue</option>' +
                            '<option value="purple" ' + purple + '>Purple</option>' +
                            '<option value="pink" ' + pink + '>Pink</option>' +

                            '</select>' +

                            '<button class="btn btn-secondary" id="m_editCurrentView_e_inputGroup' + buttonIndex + '_b_moveUp" onclick="controller.editViewMoveUp(' + viewIndex + ', ' + buttonIndex + ');">⬆</button>' +
                            '<button class="btn btn-secondary" id="m_editCurrentView_e_inputGroup' + buttonIndex + '_b_moveDown" onclick="controller.editViewMoveDown(' + viewIndex + ', ' + buttonIndex + ');">⬇</button>' +
                            '<button class="btn btn-danger" id="m_editCurrentView_e_inputGroup' + buttonIndex + '_b_delete"  onclick="controller.editViewDelete(' + viewIndex + ', ' + buttonIndex + ');">🗑</button>' +
                            '</div>';
                    } else {
                        viewName = element;
                        titleCopied = true;
                    }

                    buttonIndex++;
                }
            }
            viewIteration++;
        }

        if (!foundCurrentView) {
            console.error('NO MATCH: ' + mostRecentView);
        }

        outputCode += '' +
            '<h6>"' + viewName + '"</h6>';

        outputCode += sectionCode;

        // Add bottom buttons
        outputCode += '' +
            '<div class="d-grid gap-2 d-md-flex justify-content-md-between mt-4">' +
            '<button type="button" class="btn btn-primary btn-lg" onclick="controller.editViewAddNewButton(' + viewIndex + ');">Add New Button</button>' +
            '<button type="button" class="btn btn-secondary btn-lg" data-bs-dismiss="modal">Close</button>' +
            '</div>';

        m_editCurrentView_e_body.innerHTML = outputCode;
    }

    // Reset buttons to default
    setViewStorageToDefault() {
        this.viewStorage = [
            [ "Default",
                ["green", "👍🏻 Yes"], ["yellow", "🤷🏻 Maybe"], ["blue", "🙋🏻‍♂️ I Need Something"], ["red", "👎🏻 No"]

            ]
        ];

        updateButtonHTML(this.fromViewNameGetInnerHTML('Default'));
    }

    // Save config
    saveFile(filename) {
        if (filename.length < 1)
            filename = 'config';

        console.log('\n-----SAVE FILE START-----');
        console.log('Current viewStorage contents: ', this.viewStorage);
        let jsonString = JSON.stringify(this.viewStorage);
        console.log('JSON.stringify on viewStorage: ', jsonString);
        let encodedString = btoa(encodeURIComponent(jsonString));
        console.log('btoa on jsonString: ', encodedString);
        downloadFile(filename + '_' + new Date().getTime() + '.tctconfig', encodedString);
        console.log('Cookie set.')
        console.log('-----SAVE FILE END-----');
    }

    // Load config
    loadFile(encodedString) {
        try {
            console.log('\n-----LOAD FILE START-----');
            console.log('Loaded encoded config: ', encodedString);
            let jsonString = decodeURIComponent(atob(encodedString));
            console.log('Decoded config to JSON: ', jsonString);
            if (jsonString.length < 1) {
                console.log("Config is empty.");
                showToast('toast-upload-failed');
            } else {
                this.viewStorage = JSON.parse(jsonString);

                console.log("Config loaded: ", this.viewStorage);
                showToast('toast-upload-success');

                updateButtonHTML('');
                this.refreshSwitchViewModal();
                e_nav_b_switchView.click();

            }
        } catch (e) {
            showToast('toast-upload-failed');
            return console.error('Failed to load configuration!', e); // error in the above string (in this case, yes)!
        }
        console.log('-----LOAD FILE END-----');

    }

    ////////////////////////////// EDIT CURRENT VIEW MODAL

    // Edit Current View modal, move item up
    editViewMoveUp(viewIndex, buttonIndex) {
        if (buttonIndex > 1) {
            let temp = this.viewStorage[viewIndex][buttonIndex - 1];
            this.viewStorage[viewIndex][buttonIndex - 1] = this.viewStorage[viewIndex][buttonIndex];
            this.viewStorage[viewIndex][buttonIndex] = temp;

            this.refreshEditCurrentViewModal();
            updateButtonHTML(controller.fromViewNameGetInnerHTML(mostRecentView));
        }
    }

    // Edit Current View modal, move item down
    editViewMoveDown(viewIndex, buttonIndex) {
        console.log('buttonIndex: ', buttonIndex, 'length: ', this.viewStorage[viewIndex].length);
        if (buttonIndex < this.viewStorage[viewIndex].length - 1) {
            let temp = this.viewStorage[viewIndex][buttonIndex + 1];
            this.viewStorage[viewIndex][buttonIndex + 1] = this.viewStorage[viewIndex][buttonIndex];
            this.viewStorage[viewIndex][buttonIndex] = temp;

            this.refreshEditCurrentViewModal();
            updateButtonHTML(controller.fromViewNameGetInnerHTML(mostRecentView));
        }
    }

    // Edit Current View modal, delete
    editViewDelete(viewIndex, buttonIndex) {
        this.viewStorage[viewIndex].splice(buttonIndex, 1);

        this.refreshEditCurrentViewModal();
        updateButtonHTML(controller.fromViewNameGetInnerHTML(mostRecentView));
    }

    // Edit Current View modal, add button
    editViewAddNewButton(viewIndex) {
        this.viewStorage[viewIndex].push(['', '']);

        this.refreshEditCurrentViewModal();
        updateButtonHTML(controller.fromViewNameGetInnerHTML(mostRecentView));
    }

    editViewUpdateButtonText(viewIndex, buttonIndex) {
        this.viewStorage[viewIndex][buttonIndex][1] = document.getElementById('ecvti' + buttonIndex).value;

        updateButtonHTML(controller.fromViewNameGetInnerHTML(mostRecentView));
    }

    editViewUpdateButtonColor(viewIndex, buttonIndex) {
        this.viewStorage[viewIndex][buttonIndex][0] = document.getElementById('ecvcs' + buttonIndex).value;

        updateButtonHTML(controller.fromViewNameGetInnerHTML(mostRecentView));
    }
}

/*
========== VARIABLES ========== VARIABLES ========== VARIABLES ========== VARIABLES ========== VARIABLES ===============
*/

const BUILD_VERSION = "24Q1_0114A";

const e_mainDiv = document.getElementById("e_mainDiv");
const e_nav = document.getElementById("e_nav");
const e_nav_e_version = document.getElementById("e_nav_e_version");
const e_nav_b_editCurrentView = document.getElementById("e_nav_b_editCurrentView");
const e_nav_b_switchView = document.getElementById("e_nav_b_switchView");
const m_about_e_version = document.getElementById("m_about_e_version");
const m_saveLoad_b_close = document.getElementById('m_saveLoad_b_close');
const m_saveLoad_i_downloadConfig = document.getElementById("m_saveLoad_i_downloadConfig");
const m_saveLoad_b_downloadConfig = document.getElementById("m_saveLoad_b_downloadConfig");
const m_saveLoad_i_uploadConfig = document.getElementById("m_saveLoad_i_uploadConfig");
const m_saveLoad_i_uploadConfig_v = document.getElementById('m_saveLoad_i_uploadConfig_v');
const m_saveLoad_b_uploadConfig = document.getElementById("m_saveLoad_b_uploadConfig");
const m_saveLoad_b_loadDefault = document.getElementById("m_saveLoad_b_loadDefault");
const m_switchView_b_close = document.getElementById('m_switchView_b_close');
const m_switchView_e_accordion = document.getElementById("m_switchView_e_accordion");
const m_switchView_i_addNewView = document.getElementById('m_switchView_i_addNewView');
const m_switchView_i_addNewView_v = document.getElementById('m_switchView_i_addNewView_v');
const m_switchView_b_submit = document.getElementById('m_switchView_b_submit');
const m_editCurrentView_e_body = document.getElementById("m_editCurrentView_e_body");


let screenHeight = screen.height, navHeight = e_nav.offsetHeight + 1;
let availBtnHeight = screenHeight - navHeight;
let uploadedConfig, mostRecentView = "Default";

/*
========== START ========== START ========== START ========== START ========== START ========== START ========== START =
*/

// Create controller
const controller = new Controller();

// Set build version
m_about_e_version.innerHTML = BUILD_VERSION;
e_nav_e_version.innerHTML = BUILD_VERSION;

/*
========== EVENTS ========== EVENTS ========== EVENTS ========== EVENTS ========== EVENTS ========== EVENTS ============
*/

e_nav_b_switchView.onclick = () => {
    controller.refreshSwitchViewModal();
};
e_nav_b_editCurrentView.onclick = () => {
    controller.refreshEditCurrentViewModal();
};
m_saveLoad_b_downloadConfig.onclick = () => {
    controller.saveFile(m_saveLoad_i_downloadConfig.value);
}
m_saveLoad_i_uploadConfig.onchange = () => {
    let filename = m_saveLoad_i_uploadConfig.value, extension = '.tctconfig';

    m_saveLoad_i_uploadConfig_v.hidden = false;

    if (filename.substring(filename.length - extension.length) === extension) {
        m_saveLoad_i_uploadConfig.classList.remove('is-invalid');
        m_saveLoad_i_uploadConfig.classList.add('is-valid');
        m_saveLoad_i_uploadConfig_v.classList.remove('text-danger-emphasis');
        m_saveLoad_i_uploadConfig_v.classList.add('text-success-emphasis');
        m_saveLoad_i_uploadConfig_v.innerHTML = 'Looks good!';

        const reader = new FileReader()
        reader.onload = (e) => {
            uploadedConfig = e.target.result;

            m_saveLoad_b_uploadConfig.disabled = false;
            m_saveLoad_b_uploadConfig.classList.remove('btn-danger');
            m_saveLoad_b_uploadConfig.classList.add('btn-success');
        };

        for (let file of m_saveLoad_i_uploadConfig.files) {
            reader.readAsText(file)
        }
    } else {
        m_saveLoad_i_uploadConfig.value = '';
        m_saveLoad_i_uploadConfig.classList.remove('is-valid');
        m_saveLoad_i_uploadConfig.classList.add('is-invalid');

        m_saveLoad_b_uploadConfig.disabled = true;
        m_saveLoad_b_uploadConfig.classList.remove('btn-success');
        m_saveLoad_b_uploadConfig.classList.add('btn-danger');

        m_saveLoad_i_uploadConfig_v.classList.remove('text-success-emphasis');
        m_saveLoad_i_uploadConfig_v.classList.add('text-danger-emphasis');
        m_saveLoad_i_uploadConfig_v.innerHTML = 'Choose a file with the correct extension!';
    }
}
m_saveLoad_b_uploadConfig.onclick = () => {
    controller.loadFile(uploadedConfig);
    m_saveLoad_b_close.click();

    m_saveLoad_i_uploadConfig.value = '';
    m_saveLoad_i_uploadConfig.classList.remove('is-valid');
    m_saveLoad_i_uploadConfig.classList.remove('is-invalid');

    m_saveLoad_b_uploadConfig.disabled = true;
    m_saveLoad_b_uploadConfig.classList.remove('btn-success');
    m_saveLoad_b_uploadConfig.classList.remove('btn-danger');

    m_saveLoad_i_uploadConfig_v.classList.remove('text-success-emphasis');
    m_saveLoad_i_uploadConfig_v.classList.remove('text-danger-emphasis');
    m_saveLoad_i_uploadConfig_v.innerHTML = '';
    m_saveLoad_i_uploadConfig_v.hidden = true;
}
m_switchView_i_addNewView.oninput = () => {
    let typedViewName = m_switchView_i_addNewView.value.trim();
    let invalidInput = false, validationText = 'Looks good!';

    // check if the typedViewName equals any pre-existing view names
    if (typedViewName.length < 1) {
        invalidInput = true;
        validationText = 'Enter a name!'
    }

    if (controller.viewNameAlreadyExists(typedViewName)) {
        invalidInput = true;
        validationText = 'Another view already has the same name!'
    }

    m_switchView_i_addNewView_v.hidden = false;

    if (invalidInput) {
        m_switchView_i_addNewView.classList.remove('is-valid');
        m_switchView_i_addNewView.classList.add('is-invalid');

        m_switchView_b_submit.disabled = true;
        m_switchView_b_submit.classList.remove('btn-success');
        m_switchView_b_submit.classList.add('btn-danger');

        m_switchView_i_addNewView_v.classList.remove('text-success-emphasis');
        m_switchView_i_addNewView_v.classList.add('text-danger-emphasis');
        m_switchView_i_addNewView_v.innerHTML = validationText;
    } else {
        m_switchView_i_addNewView.classList.remove('is-invalid');
        m_switchView_i_addNewView.classList.add('is-valid');

        m_switchView_b_submit.disabled = false;
        m_switchView_b_submit.classList.remove('btn-danger');
        m_switchView_b_submit.classList.add('btn-success');

        m_switchView_i_addNewView_v.classList.remove('text-danger-emphasis');
        m_switchView_i_addNewView_v.classList.add('text-success-emphasis');
        m_switchView_i_addNewView_v.innerHTML = validationText;
    }
}
m_switchView_b_submit.onclick = () => {
    controller.addNewView(m_switchView_i_addNewView.value);

    m_switchView_i_addNewView.value = '';
    m_switchView_i_addNewView.classList.remove('is-valid');
    m_switchView_i_addNewView.classList.remove('is-invalid');

    m_switchView_b_submit.disabled = true;
    m_switchView_b_submit.classList.remove('btn-success');
    m_switchView_b_submit.classList.remove('btn-danger');

    m_switchView_i_addNewView_v.classList.remove('text-success-emphasis');
    m_switchView_i_addNewView_v.classList.remove('text-danger-emphasis');
    m_switchView_i_addNewView_v.innerHTML = '';
    m_switchView_i_addNewView_v.hidden = true;

    controller.refreshSwitchViewModal();
}
m_saveLoad_b_loadDefault.onmousedown = () => {
    m_saveLoad_b_loadDefault_clickTimerStart();
}
m_saveLoad_b_loadDefault.ontouchstart = () => {
    m_saveLoad_b_loadDefault_clickTimerStart();
}
m_saveLoad_b_loadDefault.onmouseup = () => {
    m_saveLoad_b_loadDefault_clickTimerEnd();
}
m_saveLoad_b_loadDefault.ontouchend = () => {
    m_saveLoad_b_loadDefault_clickTimerEnd();
}
m_saveLoad_b_loadDefault.onmouseleave = () => {
    m_saveLoad_b_loadDefault.classList.remove('clickTooShortBump');
    m_saveLoad_b_loadDefault.classList.remove('startClickGrow');
    m_saveLoad_b_loadDefault_dateFirstClicked = null;
}

let m_saveLoad_b_loadDefault_dateFirstClicked;
function m_saveLoad_b_loadDefault_clickTimerStart() {
    m_saveLoad_b_loadDefault_dateFirstClicked = Date.now();
    m_saveLoad_b_loadDefault.classList.add('startClickGrow');
}
function m_saveLoad_b_loadDefault_clickTimerEnd() {
    let dateLastClicked = Date.now();
    let timeDelta = dateLastClicked - m_saveLoad_b_loadDefault_dateFirstClicked;

    m_saveLoad_b_loadDefault.classList.remove('clickTooShortBump');
    m_saveLoad_b_loadDefault.classList.remove('startClickGrow');

    if (timeDelta > 1500) {
        controller.setViewStorageToDefault();
        m_saveLoad_b_close.click();
    } else {
        m_saveLoad_b_loadDefault.classList.add('clickTooShortBump');
    }
}

onresize = (event) => {
    updateButtonHTML(controller.fromViewNameGetInnerHTML(mostRecentView));
};