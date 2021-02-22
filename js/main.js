
import RFB from './vnc/rfb.js';
import KeyTable from "./vnc/input/keysym.js";
const Keyboard = window.SimpleKeyboard.default;
import board from './lib/keyboard/borad.js';

const UI = {
    connected: false,
    host: window.location.hostname,
    port: window.location.port,
    path: 'ws',
    quality: 5,
    compression: 2,
    id: '',
    password: 'XZAvYpe4fo61GFbZAUjP',
    reconnect_delay: 500,

    startTime: '',
    TimerHandle: null,
    keyboard: null,

    connect() {

        // Ignore when rfb already exists
        if (typeof UI.rfb !== 'undefined') {
            return;
        }

        if (!UI.id) {
            return
        }
        const host = UI.host;
        const port = UI.port;
        const path = UI.path;

        if (typeof UI.password === 'undefined') {
            return;
        }

        if (!host) {
            console.error("Can't connect when host is: " + host);
            return;
        }

        let url;
        if (window.location.protocol === "https:") {
            url = 'wss';
        } else {
            url = 'ws';
        }
        url += '://' + host;
        if (port) {
            url += ':' + port;
        }
        url += '/' + path;
        url += `?token=${UI.id}`;

        UI.rfb = new RFB(document.getElementById('screen'), url,
            { credentials: { password: UI.password } });

        UI.rfb.addEventListener("connect", UI.connectFinished);
        UI.rfb.addEventListener("disconnect", UI.disconnectFinished);
        UI.rfb.addEventListener("credentialsrequired", UI.credentials);
        // UI.rfb.addEventListener("securityfailure", UI.securityFailed);
        // UI.rfb.addEventListener("capabilities", UI.updatePowerButton);
        // UI.rfb.addEventListener("clipboard", UI.clipboardReceive);
        // UI.rfb.addEventListener("bell", UI.bell);
        UI.rfb.addEventListener("desktopname", UI.updateDesktopName);

        UI.rfb.scaleViewport = true;
        UI.rfb.showDotCursor = true;

        // UI.rfb.resizeSession = UI.getSetting('resize') === 'remote';
        UI.rfb.qualityLevel = parseInt(UI.quality);
        UI.rfb.compressionLevel = parseInt(UI.compression);

        UI.startCountTime();
        /**
         * Key Start
         */

        UI.keyboard = new Keyboard({
            onChange: input => this.onChange(input),
            onKeyPress: button => this.onKeyPress(button),
            onKeyReleased: button => this.onKeyReleased(button),
            theme: "hg-theme-default hg-theme-ios",
            layout: {
                default: [
                "q w e r t y u i o p",
                "a s d f g h j k l",
                "{shift} z x c v b n m {bksp}",
                "{alt} {space} {enter}"
                ],
                shift: [
                "Q W E R T Y U I O P",
                "A S D F G H J K L",
                "{shiftactivated} Z X C V B N M {bksp}",
                "{alt} {space} {enter}"
                ],
                alt: [
                "1 2 3 4 5 6 7 8 9 0",
                `- / | : ; ( ) $`,
                "{more} ~ , @ . ? {bksp}",
                "{default} {space} {enter}"
                ],
                more: [
                    "[ ] { } # % ^ * + =",
                    "_ \\ ` < > & \" '",
                    "{num} ~ , @ . ? {bksp}",
                    "{default} {space} {enter}" 
                ]
            },
            display: {
                "{alt}": ".?123",
                "{smileys}": "\uD83D\uDE03",
                "{shift}": "⇧",
                "{shiftactivated}": "⇧",
                "{enter}": "return",
                "{bksp}": "⌫",
                "{altright}": ".?123",
                "{downkeyboard}": "🞃",
                "{space}": " ",
                "{default}": "ABC",
                "{back}": "⇦",
                "{more}": "更多",
                "{num}": "123"
            }     
        });
        document.getElementById('boardIcon').style.display='block'
    },

    connectFinished(e) {
        UI.connected = true;
        console.log("Connected to " + UI.desktopName)
        // Do this last because it can only be used on rendered elements
        UI.rfb.focus();
    },
    disconnectFinished(e) {
        const wasConnected = UI.connected;

        // This variable is ideally set when disconnection starts, but
        // when the disconnection isn't clean or if it is initiated by
        // the server, we need to do it here as well since
        // UI.disconnect() won't be used in those cases.
        UI.connected = false;

        UI.rfb = undefined;

        if (!e.detail.clean) {
            console.log('disconnected');
            if (wasConnected) {
                console.error("Something went wrong, connection is closed");
            } else {
                console.error("Failed to connect to server");
            }
        } else {
            console.log('reconnecting');

            const delay = parseInt(UI.reconnect_delay);
            UI.reconnectCallback = setTimeout(UI.reconnect, delay);
            return;
        }
    },
    reconnect() {
        UI.reconnectCallback = null;

        UI.connect();
    },
    credentials() {
        UI.rfb.sendCredentials({ password: UI.password });
    },
    updateDesktopName(e) {
        UI.desktopName = e.detail.name;
    },

    // time recording
    startCountTime() {
        UI.getStartTime().then(time => {
            UI.startTime = time
            UI.updateTime()
        })
    },
    getStartTime() {
        return axios.get(`/das/get-acquisition-state?daId=${UI.id}`)
            .then(function (response) {
                console.log(response);
                if (response.data && response.data.errorCode == 0) {
                    let data = response.data.result;
                    if (data.status == 0) {
                        return Promise.resolve(data.vdiStartTime)
                    }
                }
                return Promise.reject("get time fail")
            });
    },

    updateTime() {
        const timeElasped = new Date().getTime() - new Date(UI.startTime)
        let hours = Math.floor(timeElasped / (1000 * 60 * 60))
        let minutes = Math.floor((timeElasped % (1000 * 60 * 60)) / (1000 * 60)) + ''
        let seconds = Math.floor((timeElasped % (1000 * 60)) / 1000) + ''

        hours += ''
        hours = hours.padStart(2, '0')
        minutes += ''
        minutes = minutes.padStart(2, '0')
        seconds += ''
        seconds = seconds.padStart(2, '0')

        const record = document.querySelector("#record-time")
        record.innerHTML = `${hours}:${minutes}:${seconds}`

        UI.TimerHandle = null;
        UI.TimerHandle = setTimeout(UI.updateTime, 1000)
    },
    onChange(input) {},

    onKeyPress(button) {
        console.log("Button pressed", button);
        if (button.includes("{") && button.includes("}")) {
            this.handleShift(button);
        } else {
            board.showBoard(button)
        }
        var Regx = /^[A-Za-z0-9]*$/
        let key = ''
        if (Regx.test(button)) {
            key  = `XK_${button}`
        } else {
            // const modifiers = ['{tab}', '{lock}', '{shift}', '{bksp}', '{enter}', '{space}']
            const modifiers = ['{tab}', '{lock}', '{}','{bksp}', '{enter}', '{space}']
            if (modifiers.indexOf(button) != -1) {
                const index = modifiers.indexOf(button)
                const keylist = ['XK_Tab', 'XK_Scroll_Lock', 'XK_Shift_L', 'XK_BackSpace', 'XK_Return', 'XK_space']
                key = keylist[index]
                // click delete then clear the line-high on keyboard
                if (button == '{bksp}') {
                    board.clearLine()
                }
            }
            const shiftDot = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?']
            if (shiftDot.indexOf(button) != -1) {
                const index = shiftDot.indexOf(button)
                const shiftDotKey = ['XK_asciitilde', 'XK_exclam', 'XK_at', 'XK_numbersign', 'XK_dollar', 'XK_percent', 'XK_asciicircum', 'XK_ampersand', 'XK_asterisk', 'XK_parenleft', 'XK_parenright', 'XK_underscore', 'XK_plus', 'XK_braceleft', 'XK_braceright', 'XK_bar', 'XK_colon', 'XK_quotedbl', 'XK_less', 'XK_greater', 'XK_question']
                key = shiftDotKey[index]
            }
            const dot = ['`', '-', '=', '[', ']', '\\', ';', "'", ',', '.', '/']
            if (dot.indexOf(button) != -1) {
                const index = dot.indexOf(button)
                const dotKey = ['XK_grave', 'XK_minus', 'XK_equal', 'XK_bracketleft', 'XK_bracketright', 'XK_backslash', 'XK_semicolon', 'XK_apostrophe', 'XK_comma', 'XK_period', 'XK_slash']
                key = dotKey[index]
            }
        }
        if (KeyTable[key]) {
            console.log(KeyTable[key])
            UI.rfb.sendKey(KeyTable[key], "ControlLeft", true);
        }
    },

    onKeyReleased (button) {
        // console.log('松开按钮' + button)
    },

    // 后添加的内容
    handleShift (button) {
        let currentLayout = UI.keyboard.options.layoutName;
        let layoutName;
      
        switch (button) {
            case "{shift}":
                case "{shiftactivated}":
                case "{default}":
                layoutName = currentLayout === "default" ? "shift" : "default";
                break;
    
                case "{alt}":
                case "{altright}":
                layoutName = currentLayout === "alt" ? "default" : "alt";
                break;
    
                case "{num}":
                case "{more}":
                layoutName = currentLayout === "more" ? "alt" : "more";
                break;
    
                default:
                break;
        }
      
        if (layoutName) {
            UI.keyboard.setOptions({
            layoutName: layoutName
          });
        }
    }

}
export default UI;
