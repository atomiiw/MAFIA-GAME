import { setIsTalking, hideConversation } from "./dialogue_interface";

export function NPCDialogueSystem(npc_name) {

    setIsTalking(true);

    let npc_speaking = false;
    let player_speaking = true;

    // Create a UI input field
    const input_box = add([
        rect(600, 110), 
        pos(width() / 2, height() /2 + 300), 
        anchor("center"),
        color(255, 255, 255),
        outline(4, rgb(0, 0, 0)),
        fixed()
    ]);

    // Text object to display user input
    const textDisplays = [];

    const MaxLines = 3;
    const MaxChar = 47;

    // Create MaxLines text objects for text display
    for (let i = 0; i < MaxLines; i++) {
        textDisplays.push(add([
            text("", { size: 20 }),
            pos(width() / 2 - 290,  height() /2 + 260 + i * 30), // Spaced for better visibility
            color(0, 0, 0),
            fixed()
        ]));
    }

    // Store the current input text
    let full_input = ['You: '];
    textDisplays[0].text = ['You: '];
    let currentLine = 0; // Tracks the active line for typing

    let just_typed = false;

    // Detects and registers if the input ch is upper case
    let shiftPressed = false;
    onKeyDown("shift", () => shiftPressed = true);
    onKeyRelease("shift", () => shiftPressed = false);

    onCharInput((ch) => {

        if (player_speaking == false) {
            return;
        }

        player_speaking = true;

        const ch_f = shiftPressed ? ch.toUpperCase() : ch;

        if (full_input[currentLine] === undefined) {
            full_input[currentLine] = "";
        }

        // Append character
        full_input[currentLine] += ch_f;
        let char_str = full_input[currentLine];

        // On the first word of every line, switch to a new line
        if (char_str.length == 1) {
            if (currentLine >= textDisplays.length) {
                textDisplays[0].text = textDisplays[1].text;
                textDisplays[1].text = textDisplays[2].text;
                textDisplays[2].text = char_str;
            }
        }

        if (currentLine >= textDisplays.length) {
            textDisplays[MaxLines-1].text = char_str;
        } else {
            textDisplays[currentLine].text = char_str; 
        }

        // When `char_str` is at the limit, update the line
        if (char_str.length == MaxChar) {
            currentLine++;
        }

        just_typed = true;

        player_speaking

    });

    onKeyPress("backspace", () => {

        if (player_speaking == false) {
            return;
        }

        let line_switch = false;

        if (full_input[currentLine] === undefined || full_input[currentLine].length === 0) {
            // if there is a previous line, go to the previous line
            if (currentLine > 0) {
                if (full_input[full_input.length - 1] === "") {
                    full_input.pop();
                }
                currentLine--;
                line_switch = true
            }
        } else {
            // if not input exists yet
            full_input[currentLine] = full_input[currentLine].slice(0, -1);
        }

        let char_str = full_input[currentLine] || ""; // Ensure it's not undefined

        if (currentLine >= textDisplays.length - 1) {
            textDisplays[MaxLines - 1].text = char_str;
            if (line_switch == true) {
                textDisplays[1].text = full_input[currentLine-1];
                textDisplays[0].text = full_input[currentLine-2];
            }
        } else {
            textDisplays[currentLine].text = char_str;
        }

        just_typed = true;

    });

    let line_view = currentLine;
    let lastScrollTime = 0; // Tracks the last scroll event time
    const scrollDelay = 100; // scrolling detection every 0.1 seconds

    // Scrolling
    window.addEventListener("wheel", (event) => {

        // Wait at least 0.1 seconds for the next scrolling detection
        const now = Date.now();
        if (now - lastScrollTime < scrollDelay) {
            return; // Ignore if it's too soon
        }
        lastScrollTime = now; // Update the last scroll time

        if (just_typed == true){
            line_view = currentLine;
        }

        const mouse = mousePos(); // Get current mouse position
        let inside_rec = false;

        // Check if mouse is inside the rectangle
        if (
            mouse.x >= input_box.pos.x - input_box.width / 2 &&
            mouse.x <= input_box.pos.x + input_box.width / 2 &&
            mouse.y >= input_box.pos.y - input_box.height / 2 &&
            mouse.y <= input_box.pos.y + input_box.height / 2
        ) {
            inside_rec = true;
        }

        const scrollSpeed = event.deltaY; // Positive for down, negative for up

        // Scroll up (finger moves down)
        if (scrollSpeed < 0 && inside_rec == true) {
            if (line_view >= textDisplays.length) {
                line_view--;
                textDisplays[0].text = full_input[line_view - 2] || "";
                textDisplays[1].text = full_input[line_view - 1] || "";
                textDisplays[2].text = full_input[line_view] || "";
            }
        }

        // Scroll down (finger moves up)
        if (scrollSpeed > 0  && inside_rec == true) {
            if (line_view >= textDisplays.length - 1 && line_view <= full_input.length - 2) {
                line_view++;
                textDisplays[0].text = full_input[line_view - 2] || "";
                textDisplays[1].text = full_input[line_view - 1] || "";
                textDisplays[2].text = full_input[line_view] || "";
            }
        }

        just_typed = false;

    });

    let user_history = "";

    // Done typing
    onKeyPress("enter", () => {

        if (npc_speaking == true) {
            console.log('player sk = f');
            return;
        }

        textDisplays[0].text = "";
        textDisplays[1].text = "";
        textDisplays[2].text = "";

        user_history += full_input.join("").slice(5);
        full_input.length = 0;

        currentLine = 0;

        player_speaking = false;

        NPCspeak();

    });

    let npc_current_speech = "The Duke University School of Medicine and Duke's Fuqua School of Business have established their own instances of Canvas. If you are attempting to access a course for either of those schools, you can access their instances of Canvas below.";
    let npc_history = "";

    function NPCspeak() {
        
        npc_speaking = true;

        let npc_full_speech = npc_name + ": " + npc_current_speech;

        // Divide speech into chunks of MaxChar characters
        let npc_speech_lines = [];
        for (let i = 0; i < npc_full_speech.length; i += MaxChar) {
            npc_speech_lines.push(npc_full_speech.slice(i, i + MaxChar));
        }

        line_view = 0;
        currentLine = 0;
        let index = 0;

        function displayNextLine() {

            if (index == npc_speech_lines.length) {
                npc_speaking = false;
                return;
            }
        
            let words = npc_speech_lines[index].split(" "); // Split line into words
            let wordIndex = 0;
            let lineText = ""; // Accumulator for displayed text
        
            function addWord() {
                if (wordIndex >= words.length) {
                    index++; // Move to next line after all words are displayed
                    setTimeout(displayNextLine, 100); // Pause before next line
                    return;
                }
        
                if (lineText.length > 0) lineText += " "; // Add space between words
                lineText += words[wordIndex]; // Add next word
        
                full_input[index] = lineText; 
                currentLine = index;
        
                if (index <= 2) {
                    textDisplays[index].text = full_input[index];
                } else {
                    if (wordIndex == 0){
                        textDisplays[0].text = textDisplays[1].text;
                        textDisplays[1].text = textDisplays[2].text;
                    }
                    textDisplays[2].text = full_input[index];
                }
        
                wordIndex++;
        
                setTimeout(addWord, 100); // Display next word in 0.1s
            }
        
            addWord(); // Start displaying words
        }    

        displayNextLine();

        // space: done listening to npc speech
        onKeyPress("space", () => {
            if (!npc_speaking && !player_speaking) {
                textDisplays[0].text = "You: ";
                textDisplays[1].text = "";
                textDisplays[2].text = "";

                npc_history += full_input.join("").slice(5);
                full_input.length = 0;
                full_input = ['You: '];

                currentLine = 0;
                player_speaking = true;
            }
        });
    }

    // cannot pause the conversation while npc is speaking:
    onKeyPress("escape", function() {
        if (npc_speaking){
            return;
        }
        input_box.destroy();
        textDisplays[0].text = "";
        textDisplays[1].text = "";
        textDisplays[2].text = "";
        npc_speaking = false;
        player_speaking = true;

        // isTalking = false
        setIsTalking(false);

        hideConversation();
    });

}