var BadChars = "`~!@^*()_={[}]\|:;\"',<.>/?";
var TableAcrossWord, TableDownWord;
var CurrentWord, PrevWordHorizontal, x, y, i, j;
var CrosswordFinished, Initialized;

// Check the user's browser and then initialize the puzzle.
if (document.getElementById("waitmessage") != null)
{
	document.getElementById("waitmessage").innerHTML = "Please wait while the crossword is loaded...";
	
	// Current game variables
	CurrentWord = -1;
	PrevWordHorizontal = false;
	
	// Create the cell-to-word arrays.
	TableAcrossWord = new Array(CrosswordWidth);
	for (var x = 0; x < CrosswordWidth; x++) TableAcrossWord[x] = new Array(CrosswordHeight);
	TableDownWord = new Array(CrosswordWidth);
	for (var x = 0; x < CrosswordWidth; x++) TableDownWord[x] = new Array(CrosswordHeight);
	for (var y = 0; y < CrosswordHeight; y++)
		for (var x = 0; x < CrosswordWidth; x++)
		{
			TableAcrossWord[x][y] = -1;
			TableDownWord[x][y] = -1;
		}
	
	// First, add the horizontal words to the puzzle.
	for (var i = 0; i <= LastHorizontalWord; i++)
	{
		x = WordX[i];
		y = WordY[i];
		for (var j = 0; j < WordLength[i]; j++)
		{
			TableAcrossWord[x + j][y] = i;
		}
	}
	
	// Second, add the vertical words to the puzzle.
	for (var i = LastHorizontalWord + 1; i < Words; i++)
	{
		x = WordX[i];
		y = WordY[i];
		for (var j = 0; j < WordLength[i]; j++)
		{
			TableDownWord[x][y + j] = i;
		}
	}
	
	// Now, insert the row HTML into the table.
	for (var y = 0; y < CrosswordHeight; y++)
	{
		document.writeln("<tr>");
		for (var x = 0; x < CrosswordWidth; x++)
		{
			if (TableAcrossWord[x][y] >= 0 || TableDownWord[x][y] >= 0)
				document.write("<td id=\"c" + PadNumber(x) + PadNumber(y) + "\" class=\"ecw-box ecw-boxnormal_unsel\" onclick=\"SelectThisWord(event);\">&nbsp;</td>");
			else
				document.write("<td></td>");
		}
		document.writeln("</tr>");
	}
	
	// Finally, show the crossword and hide the wait message.
	Initialized = true;
	document.getElementById("waitmessage").style.display = "none";
}

// ----------
// Event handlers

// Raised when a key is pressed in the word entry box.
function WordEntryKeyPress(event)
{
	if (CrosswordFinished) return;
	// Treat an Enter keypress as an OK click.
	if (CurrentWord >= 0 && event.keyCode == 13) OKClick();
}

// ----------
// Helper functions

// Called when we're ready to start the crossword.
function BeginCrossword()
{
	if (Initialized)
	{
		document.getElementById("welcomemessage").style.display = "";
		document.getElementById("checkbutton").style.display = "";
	}
}

// Returns true if the string passed in contains any characters prone to evil.
function ContainsBadChars(theirWord)
{
	for (var i = 0; i < theirWord.length; i++)
		if (BadChars.indexOf(theirWord.charAt(i)) >= 0) return true;
	return false;
}



// Returns the table cell at a particular pair of coordinates.
function CellAt(x, y)
{
	return document.getElementById("c" + PadNumber(x) + PadNumber(y));
}



// Changes the style of the cells in the current word.
function ChangeWordStyle(WordNumber, NewStyle)
{
	if (WordNumber< 0) return;
	var x = WordX[WordNumber];
	var y = WordY[WordNumber];
	
	if (WordNumber<= LastHorizontalWord)
		for (i = 0; i < WordLength[WordNumber]; i++)
			CellAt(x + i, y).className = NewStyle;
	else
		for (i = 0; i < WordLength[WordNumber]; i++)
			CellAt(x, y + i).className = NewStyle;
}

// Changes the style of the cells in the current word between the selected/unselected form.
function ChangeCurrentWordSelectedStyle(IsSelected)
{
	if (CurrentWord < 0) return;
	var x = WordX[CurrentWord];
	var y = WordY[CurrentWord];
	
	if (CurrentWord <= LastHorizontalWord)
		for (i = 0; i < WordLength[CurrentWord]; i++)
			CellAt(x + i, y).className = CellAt(x + i, y).className.replace(IsSelected ? "_unsel" : "_sel", IsSelected ? "_sel" : "_unsel");
	else
		for (i = 0; i < WordLength[CurrentWord]; i++)
			CellAt(x, y + i).className = CellAt(x, y + i).className.replace(IsSelected ? "_unsel" : "_sel", IsSelected ? "_sel" : "_unsel");
}



function ShowWordInputAndClue() {
	if (CurrentWord < 0) return;

	var TheirWord = "";
	var TheirWordLength = 0;
	for (var i = 0; i < WordLength[CurrentWord]; i++) {
		var TableCell = CellAt(WordX[CurrentWord] + (CurrentWord <= LastHorizontalWord ? i : 0),
			WordY[CurrentWord] + (CurrentWord > LastHorizontalWord ? i : 0));
		if (TableCell.innerHTML != null && TableCell.innerHTML.length > 0 && TableCell.innerHTML != " " && TableCell.innerHTML.toLowerCase() != "&nbsp;") {
			TheirWord += TableCell.innerHTML.toUpperCase();
			TheirWordLength++;
		} else {
			TheirWord += "&bull;";
		}
	}

	document.getElementById("wordlabel").innerHTML = TheirWord;
	document.getElementById("wordinfo").innerHTML = ((CurrentWord <= LastHorizontalWord) ? "Horizontally, " : "Vertically, ") + WordLength[CurrentWord] + " letter(s).";
	document.getElementById("wordclue").innerHTML = Clue[CurrentWord];
	document.getElementById("worderror").style.display = "none";
	document.getElementById("wordentry").value = TheirWordLength == WordLength[CurrentWord] ? TheirWord : "";

	// Display the answer box and overlay
	document.getElementById("answerbox").style.display = "block";
	document.getElementById("answerOverlay").style.display = "block";
	try {
		document.getElementById("wordentry").focus();
		document.getElementById("wordentry").select();
	} catch (e) {
		// Handle any focus-related errors here
	}
}


function OKClick() {
	var TheirWord = document.getElementById("wordentry").value.toUpperCase();
	if (CrosswordFinished) return;

	// Validate the entry for bad characters.
	if (ContainsBadChars(TheirWord)) {
		showError("Only letters allowed.");
		return;
	}

	// Check if the word length matches the expected length.
	if (TheirWord.length !== WordLength[CurrentWord]) {
		var errorMessage = TheirWord.length < WordLength[CurrentWord] ?
			"Not enough letters. The word consists of " + WordLength[CurrentWord] + " letters." :
			"Too many letters. The word consists of " + WordLength[CurrentWord] + " letters.";
		showError(errorMessage);
		return;
	}

	// If no errors, fill the crossword and hide the overlay.
	fillGridWithTheirWord(TheirWord);
	hideError();
	DeselectCurrentWord();
}

function fillGridWithTheirWord(theirWord) {
	var x = WordX[CurrentWord], y = WordY[CurrentWord];
	for (var i = 0; i < theirWord.length; i++) {
		var cell = CellAt(x + (CurrentWord <= LastHorizontalWord ? i : 0), y + (CurrentWord > LastHorizontalWord ? i : 0));
		cell.innerHTML = theirWord.charAt(i);
	}
}

function showError(message) {
	var errorElement = document.getElementById("worderror");
	errorElement.innerText = message;
	errorElement.style.display = "block";
}

function hideError() {
	var errorElement = document.getElementById("worderror");
	errorElement.style.display = "none";
}

function DeselectCurrentWord() {
	// Only deselect and hide the overlay if the word was entered correctly.
	// This function should be modified so it doesn't hide the overlay automatically on error.
	if (CurrentWord < 0) return;
	ChangeCurrentWordSelectedStyle(false);
	CurrentWord = -1;

	// If called after successful word entry, hide the overlay.
	if (document.getElementById("worderror").style.display === "none") {
		document.getElementById("answerbox").style.display = "none";
		document.getElementById("answerOverlay").style.display = "none";
	}
}


// Called when the "check puzzle" link is clicked.
function CheckClick()
{
	var i, j, x, y, UserEntry, ErrorsFound = 0, EmptyFound = 0, TableCell;
	if (CrosswordFinished) return;
	DeselectCurrentWord();
	
	for (y = 0; y < CrosswordHeight; y++)
	for (x = 0; x < CrosswordWidth; x++)
		if (TableAcrossWord[x][y] >= 0 || TableDownWord[x][y] >= 0)
		{
			TableCell = CellAt(x, y);
			if (TableCell.className == "ecw-box ecw-boxerror_unsel") TableCell.className = "ecw-box ecw-boxnormal_unsel";
		}
		
	for (i = 0; i < Words; i++)
	{
		// Get the user's entry for this word.
		UserEntry = "";
		for (j = 0; j < WordLength[i]; j++)
		{
			if (i <= LastHorizontalWord)
				TableCell = CellAt(WordX[i] + j, WordY[i]);
			else
				TableCell = CellAt(WordX[i], WordY[i] + j);
			if (TableCell.innerHTML.length > 0 && TableCell.innerHTML.toLowerCase() != "&nbsp;")
			{
				UserEntry += TableCell.innerHTML.toUpperCase();
			}
			else
			{
				UserEntry = "";
				EmptyFound++;
				break;
			}
		}
		// If this word doesn't match, it's an error.
		if (HashWord(UserEntry) != AnswerHash[i] && UserEntry.length > 0)
		{
			ErrorsFound++;
			ChangeWordStyle(i, "ecw-box ecw-boxerror_unsel");
		}
	}
	
	// If they can only check once, disable things prematurely.
	if ( OnlyCheckOnce )
	{
		CrosswordFinished = true;
		document.getElementById("checkbutton").style.display = "none";
	}
	
    // If errors were found, just exit now.
    if (ErrorsFound > 0 && EmptyFound > 0)
        document.getElementById("welcomemessage").innerHTML = ErrorsFound + (ErrorsFound > 1 ? " errors" : " error") + " and " + EmptyFound + (EmptyFound > 1 ? " incomplete words were" : " incomplete word was") + " found.";
    else if (ErrorsFound > 0)
        document.getElementById("welcomemessage").innerHTML = ErrorsFound + (ErrorsFound > 1 ? " errors were" : " error was") + " found.";
    else if (EmptyFound > 0)
        document.getElementById("welcomemessage").innerHTML = "No errors, but " + EmptyFound + (EmptyFound > 1 ? " words left to solve" : " word left to solve") + " ."; // Translated from "Нет ошибок, но " + EmptyFound + (EmptyFound > 1 ? " слов осталось разгадать" : " слово осталось разгодать") + " ."
    
	if (ErrorsFound + EmptyFound > 0)
	{
		document.getElementById("welcomemessage").style.display = "";
		return;
	}
			
	// They finished the puzzle!
	CrosswordFinished = true;
	document.getElementById("checkbutton").style.display = "none";
	document.getElementById("congratulations").style.display = "block";
	document.getElementById("welcomemessage").style.display = "none";
}

// Called when the "cheat" link is clicked.
function CheatClick()
{
	if (CrosswordFinished) return;
	var OldWord = CurrentWord;
	document.getElementById("wordentry").value = Word[CurrentWord];
	OKClick();
	ChangeWordStyle(OldWord, "ecw-box ecw-boxcheated_unsel");
}

// Returns a one-way hash for a word.
function HashWord(Word)
{
	var x = (Word.charCodeAt(0) * 719) % 1138;
	var Hash = 837;
	var i;
	for (i = 1; i <= Word.length; i++)
		Hash = (Hash * i + 5 + (Word.charCodeAt(i - 1) - 64) * x) % 98503;
	return Hash;
}


document.addEventListener('click', function(event) {
    var isClickInsideAnswerBox = document.getElementById('answerbox').contains(event.target);
    var isClickOnOverlay = event.target === document.getElementById('answerOverlay');

    if (isClickOnOverlay && !isClickInsideAnswerBox) {
        hideOverlay();
    }
});


function showOverlay() {
    document.getElementById("answerOverlay").style.display = "flex";
    document.getElementById("answerbox").style.display = "block";
    // Manually setting text for testing
    document.getElementById("wordlabel").innerText = "Test Word Label";
    document.getElementById("wordinfo").innerText = "Test Word Info";
    document.getElementById("wordclue").innerText = "Test Word Clue";
}


function hideOverlay() {
    document.getElementById("answerOverlay").style.display = "none";
    document.getElementById("answerbox").style.display = "none";
}


document.addEventListener('DOMContentLoaded', (event) => {

	
    let typingCompleted = false;
    const initialOverlay = document.createElement('div');
    initialOverlay.id = 'initialOverlay';
    const typingText = document.createElement('div');
    typingText.classList.add('typing-text');
    initialOverlay.appendChild(typingText);
    document.body.appendChild(initialOverlay);

    // Expanded content with HTML tags for styling parts in amber
    const contentParts = [
		{ content: '<h1>Welcome to the <span class="section-title">Kilkenny Hurling Legends Crossword!</span></h1>', type: 'html' },
        { content: '\n\nDive into the legacy of Kilkenny\'s hurling heroes in this engaging crossword puzzle. Each clue and answer celebrates the illustrious careers of some of the most famous hurlers from Kilkenny, a county with a rich history in the sport of hurling. From legendary goalkeepers to iconic field players, this puzzle spans generations of talent that have graced the pitch.\n\n', type: 'text' },
        { content: '<h3><span class="section-title">How It Works:</span></h3>', type: 'html' },
        { content: '\n\nNavigate the Grid: ', type: 'text' },
        { content: 'Use your mouse or touch to select a crossword square. The selected clue will appear at the top, guiding you to fill in the player\'s last name.\n', type: 'text' },
        { content: '<h3><span class="section-title">Enter Your Answers:</span></h3> ', type: 'html' },
        { content: 'Type in the last name of the hurler corresponding to the clue provided. If you\'re stuck, try moving on to other clues — sometimes, filling in surrounding answers can help!\n', type: 'text' },
        { content: '<h3><span class="section-title">Check Your Progress: </span></h3>', type: 'html' },
        { content: 'Feel free to use the "Check for mistakes" button to review your answers. But remember, each clue is a chance to recall the glorious moments these players brought to the game.\n', type: 'text' },
        { content: '<h3><span class="section-title">Submit with Confidence:</span></h3>', type: 'html' },
        { content: 'Once you\'ve filled in all the names, press the "OK" button to submit your answers. Don\'t worry if you don\'t get everything right the first time; this is an opportunity to learn about the legends of Kilkenny hurling.', type: 'text' }
    ];

    let partIndex = 0; // To keep track of which part of the content we're on
    const speed = 25; // Typing speed

	const tapToSkip = document.createElement('div');
    tapToSkip.classList.add('tap-to-skip');
    tapToSkip.textContent = 'Tap to Skip Instructions';
    initialOverlay.appendChild(tapToSkip);

	// Listener for clicks outside the answer box to close it and attempt to reset zoom
	document.addEventListener('click', function(event) {
		var isClickInsideAnswerBox = document.getElementById('answerbox') && document.getElementById('answerbox').contains(event.target);
		var isClickOnTapToSkip = event.target.classList.contains('tap-to-skip');
	
		// If the click is not inside the answer box and not on the "Tap to Skip" button, do nothing
		if (isClickInsideAnswerBox || isClickOnTapToSkip) {
			return;
		}
	
		// Close the answer box for clicks outside the answer box, and not during typing
		if (!typingCompleted && !isClickInsideAnswerBox) {
			closeAnswerBox();
		}
	});
	
	// Adjust closeAnswerBox function to check if answer box is currently shown
	function closeAnswerBox() {
		if (document.getElementById('answerOverlay').style.display !== 'none') {
			document.getElementById('answerOverlay').style.display = 'none';
			// Additional logic for resetting the state as needed
		}
	}
	

	// Specific listeners for the "OK" and "Cancel" buttons
	document.getElementById('okbutton').addEventListener('click', closeAnswerBox);
	document.getElementById('cancelbutton').addEventListener('click', closeAnswerBox);

	function closeAnswerBox() {
		document.getElementById('answerOverlay').style.display = 'none';
		// Additional actions to reset the page state as necessary
		window.scrollTo(0, 0); // Scrolls to the top to mitigate zoom
	}


    // Function to remove overlay and skip instructions
    function skipInstructions() {
        initialOverlay.style.opacity = '0';
        setTimeout(() => initialOverlay.remove(), 1000); // Remove after fade
    }

    // Event listener to skip instructions on tap/click
    tapToSkip.addEventListener('click', skipInstructions);


    function typeNextPart() {
        if (partIndex < contentParts.length) {
            const part = contentParts[partIndex];
            if (part.type === 'text') {
                typeText(part.content, () => {
                    partIndex++;
                    typeNextPart();
                });
            } else if (part.type === 'html') {
                typingText.innerHTML += part.content;
                partIndex++;
                setTimeout(typeNextPart, speed);
            }
        } else {
            typingCompleted = true;
            setTimeout(() => initialOverlay.style.opacity = '0', 5000); // Automatic fade out
        }
    }

	function typeText(text, callback) {
		let i = 0;
		function type() {
			if (i < text.length) {
				typingText.innerHTML += text.charAt(i);
				i++;
				// Ensure the latest typed content is visible
				initialOverlay.scrollTop = initialOverlay.scrollHeight;
				setTimeout(type, speed);
			} else if (callback) {
				callback();
			}
		}
		type();
	}
	

    initialOverlay.addEventListener('click', () => {
        if (!typingCompleted) {
            // Complete the typing immediately
            typingText.innerHTML += contentParts.slice(partIndex).map(part => part.content).join('');
            typingCompleted = true;
            setTimeout(() => initialOverlay.style.opacity = '0', 5000); // Wait 5 seconds then fade out
        } else {
            initialOverlay.style.opacity = '0'; // Fade out immediately if text was completed
            setTimeout(() => initialOverlay.remove(), 1000); // Remove after fade
        }
    });

    typeNextPart(); // Start typing

	
});

var crosswordPuzzles = [
	{
		CrosswordWidth : 19,
		CrosswordHeight : 30,
		Words : 20,
		WordLength : new Array(14, 8, 7, 8, 13, 10, 5, 15, 9, 12, 7, 11, 13, 18, 18, 8, 15, 13, 6, 9),
		Word : new Array("BENNETTSBRIDGE", "ERINSOWN", "CLONEEN", "GLENMORE", "BARROWRANGERS", "JOHNLOCKES", "CLARA", "CONAHYSHAMROCKS", "DICKSBORO", "CARRICKSHOCK", "FENIANS", "DUNNAMAGGIN", "JAMESSTEPHENS", "BALLYHALESHAMROCKS", "GRAIGUEBALLYCALLAN", "EMERALDS", "BLACKSANDWHITES", "GRAIGNAMANAGH", "GALMOY", "DANESFORT"),
		Clue : new Array("With a rich history in hurling, this club has contributed significantly to the sport in Kilkenny.",
			"Based in Castlecomer, this club's name evokes Irish pride and a strong community spirit.",
			"Known for its vibrant participation in hurling, this club represents a smaller community with a big heart for the game.",
			"From the southern part of Kilkenny, this club is celebrated for nurturing hurling talent and community cohesion.",
			"Named after the prominent river, this club is based in Paulstown, a testament to its local heritage.",
			"Based in Callan, this club is named after the famous philosopher, symbolizing thoughtfulness and strategy on the field",
			"Situated in the parish of the same name, this club has a proud tradition in both hurling and community engagement.",
			"This club, based in Conahy, has distinguished itself in hurling and received a foundation award for health and community initiatives​​.",
			"Based in Kilkenny City, this club is a central figure in promoting hurling and received recognition for its health-focused community work​​.",
			"This club's name is inspired by a local incident of resistance against authority, highlighting its deep community roots.",
			"Hailing from Johnstown, the club's name reflects a rebellious spirit and a deep commitment to hurling.",
			"This club, from the south of Kilkenny, has a long history of engagement in hurling and camogie.",
			"Situated in Kilkenny City, this club is named after a prominent Irish figure, reflecting its strong cultural roots.",
			"This club is renowned for its hurling legacy and has produced several All-Ireland winning players.",
			"This club combines the heritage of two areas, Graigue and Ballycallan, showcasing a united passion for hurling.",
			"Named after the vibrant green of their kit, this club from Urlingford stands out for its contributions to hurling.",
			"Originating from Skeoughvosteen, this club's unique name reflects the colors of their kit.",
			"Located by the River Barrow, this club is as enduring and flowing with talent as the river itself.",
			"Known for its mining history, this club's identity is closely tied to the local community's heritage and spirit.",
			"Located near Danesfort, this club has made notable contributions to hurling in Kilkenny."),
		AnswerHash : new Array(74456, 6337, 33392, 66102, 28570, 94772, 57962, 51543, 63562, 97321, 63149, 60365, 14910, 17722, 85377, 97294, 84745, 81266, 3153, 57123),
		WordX : new Array(3, 10, 3, 6, 1, 9, 5, 0, 14, 11, 17, 6, 8, 4, 15, 13, 2, 7, 10, 17),
		WordY : new Array(0, 4, 7, 11, 18, 22, 27, 29, 0, 2, 2, 4, 4, 5, 10, 11, 12, 17, 18, 19),
		LastHorizontalWord : 7,
		OnlyCheckOnce : false,
	},
	{
		CrosswordWidth: 14,
		CrosswordHeight: 17,
		Words: 11,
		WordLength: new Array(8, 5, 11, 6, 6, 4, 5, 4, 9, 6, 8),
		Word : new Array("HENNESSY", "KEHER", "FITZPATRICK", "LARKIN", "CLEERE", "CODY", "WALSH", "REID", "HEFFERNAN", "SKEHAN", "FENNELLY"),
		Clue : new Array("Known for his versatility on the field and a unique grip on the camán.",
			"A legendary player who scored a record in a final, yet ended on the losing side.",
			"A player who could turn on a sixpence, known for his tight yet fluent style of play.",
			"Epitomized determination and grit, overcoming physical limitations to excel in defense.",
			"A wing-back known for his elegance and style, his career was cut short by a knee injury.",
			"Guided Kilkenny to multiple triumphs, including a notable \"double-double\" victory series.",
			"Legendary goalkeeper and later manager, known for his exceptional leadership both on and off the field.",
			"A current player with exceptional under-age promise, known for his control and deft touch.",
			"His two goals in a forty-second spell were pivotal in securing a victory over Cork in a final.",
			"The first Kilkenny player to win nine All-Ireland medals, a goalie known for his innovation.",
			"A quiet yet impactful player from Ballyhale Shamrocks, known for his silent but deadly play."),
		AnswerHash : new Array(10062, 15240, 64664, 51961, 28034, 32251, 37825, 17218, 79631, 27025, 27165),
		WordX : new Array(4, 7, 3, 8, 2, 0, 10, 5, 8, 13, 3),
		WordY : new Array(3, 6, 9, 13, 14, 16, 0, 2, 2, 8, 9),
		LastHorizontalWord : 5,
		OnlyCheckOnce : false,
	}
	// Add more crossword data objects as needed
];



var CrosswordWidth = null;
var CrosswordHeight = null;
var Words = null;
var WordLength = null;
var Word = null;
var Clue = null;
var AnswerHash = null;
var WordX = null;
var WordY = null;
var LastHorizontalWord = null;
var OnlyCheckOnce = false;
var Initialized = false;
var TableAcrossWord, TableDownWord;

function initializeCrosswordWithData(crosswordData) {
	// Update global variables
	({ CrosswordWidth, CrosswordHeight, Words, WordLength, Word, Clue, AnswerHash, WordX, WordY, LastHorizontalWord, OnlyCheckOnce } = crosswordData);

	// Initialize tables for word mapping
	TableAcrossWord = Array.from({ length: CrosswordWidth }, () => Array(CrosswordHeight).fill(-1));
	TableDownWord = Array.from({ length: CrosswordWidth }, () => Array(CrosswordHeight).fill(-1));

	// Populate word tables
	for (let i = 0; i < Words; i++) {
		for (let j = 0; j < WordLength[i]; j++) {
			let x = WordX[i] + (i <= LastHorizontalWord ? j : 0);
			let y = WordY[i] + (i > LastHorizontalWord ? j : 0);
			if (i <= LastHorizontalWord) TableAcrossWord[x][y] = i;
			else TableDownWord[x][y] = i;
		}
	}

	// Clear and create the crossword grid
	var crosswordContainer = document.getElementById("crosswordContainer");
	crosswordContainer.innerHTML = "";
	createGridCells(crosswordContainer);

	// UI adjustments
	CurrentWord = -1;
	PrevWordHorizontal = false;
	CrosswordFinished = false;
	Initialized = true;
	document.getElementById("welcomemessage").style.display = "block";
	document.getElementById("checkbutton").style.display = "block";
}

function createGridCells(container) {
	for (let y = 0; y < CrosswordHeight; y++) {
		let row = document.createElement("tr");
		for (let x = 0; x < CrosswordWidth; x++) {
			let cell = document.createElement("td");
			cell.id = `c${PadNumber(x)}${PadNumber(y)}`;

			// Determine if the cell is part of any word
			if (TableAcrossWord[x][y] !== -1 || TableDownWord[x][y] !== -1) {
				cell.className = "ecw-box ecw-boxnormal"; // Apply the correct class
				// Optionally, make cell interactive only if it's part of a word
				cell.addEventListener('click', function () { SelectThisWord(x, y); });
			} else {
				// Cell is not part of a word, hide it
				cell.className = "ecw-box ecw-boxempty";
				cell.style.visibility = "hidden"; // Hide cell
			}
			row.appendChild(cell);
		}
		container.appendChild(row);
	}
}



function SelectThisWord(x, y) {
	if (CrosswordFinished) return;

	// Reset styles for previously selected word
	DeselectCurrentWord();

	// Determine the word that was clicked based on the cell coordinates
	var wordIndex = TableAcrossWord[x][y] !== -1 ? TableAcrossWord[x][y] : TableDownWord[x][y];

	// If a valid word is selected, update the UI to reflect the selection
	if (wordIndex !== -1) {
		CurrentWord = wordIndex;
		PrevWordHorizontal = CurrentWord <= LastHorizontalWord;

		for (let i = 0; i < WordLength[CurrentWord]; i++) {
			let cellX = WordX[CurrentWord] + (CurrentWord <= LastHorizontalWord ? i : 0);
			let cellY = WordY[CurrentWord] + (CurrentWord > LastHorizontalWord ? i : 0);
			let cellId = `c${PadNumber(cellX)}${PadNumber(cellY)}`;
			let cell = document.getElementById(cellId);
			cell.className = "ecw-box ecw-boxnormal_sel"; // Update class to selected
		}

		ShowWordInputAndClue();
	}
}



function PadNumber(number) {
	return number.toString().padStart(3, '0');
}

var currentCrosswordIndex = 0; // Move this outside to make it globally accessible

function switchCrossword() {
	currentCrosswordIndex = (currentCrosswordIndex + 1) % crosswordPuzzles.length;
	initializeCrosswordWithData(crosswordPuzzles[currentCrosswordIndex]);
}

document.addEventListener('DOMContentLoaded', () => {
	initializeCrosswordWithData(crosswordPuzzles[currentCrosswordIndex]);
});




