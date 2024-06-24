'use strict'
const fromRadios = document.getElementsByName("from");
const quizForm = document.getElementById("quizForm");
const getQuestionTypes = document.getElementsByName("question_type");
const generateBtn = document.getElementById("generateBtn");
let openSelected = false; // Monitor if the open input is selected

// Checks for Updating Placeholder on Input Prompt Accordingly
fromRadios.forEach(function (radio) {
  radio.addEventListener("change", function () {
    if (radio.checked && radio.value === "Context") {
      // Checks in order to update placeholder accordingly
      promptInput.setAttribute(
        "placeholder",
        "Please Enter Context for Generating Your Questions"
      );
    } else {
      promptInput.setAttribute(
        "placeholder",
        "Please Enter the Topic You Want to Generate Questions On."
      );
    }
  });
});



const no_of_choices = document.getElementsByName("no_of_choices"); // Select all elements with the name stated
getQuestionTypes.forEach((questionType) => { // On 'check' T/F or MCQs

  questionType.addEventListener("change", () => { // Adds an event listener to each element in the var.
    if (questionType.id !== "mcqs") {  // Checks to see if the current element being looped through has the ID "tf" 
      // Disable No. of Choices and Check '2'
      no_of_choices.forEach((choice) => {
        choice.style.cursor = "default";
        choice.id !== "options2" ? choice.disabled = true : null; // Disable only options 3 to 5. Once we disable a radio, even if it is checked, its value will not be registered when populating the form object. 
        choice.id === "options2" ? choice.checked = true : null;
      })

    } else {
      // Revert Actions (More like Ctrl + Z, Lmao)
      no_of_choices.forEach((choice) => {
        choice.disabled = false;
        choice.style.cursor = "pointer";
        choice.id === "options4" ? choice.checked = true : null;
      })
    }

  })
})

function hideSelections(event /* Hides "Question Type" & "Number of Choices" when "Open" Input is clicked */) {
  const openInputRad = document.getElementById("open"); // Get the radio of the open input section
  const questionsRad = document.getElementById("questions"); // Get the radio of the questions input section
  const quizRad = document.getElementById("quiz"); // Gets the radio of the quiz input section
  const clearRestoreAll = document.querySelectorAll(".clearRestore"); // Get Divs to be cleared

  if (event.checked === true /* If Open Input is checked */) {
    openSelected = true;
    clearRestoreAll.forEach(function (clearRestore) { //Select the "Question Type" & "Number of Choices" so we can hide them
      clearRestore.classList.add("hidden");
    });
  }
}


function showSelections(event) {
  if (event.checked === true) {
    openSelected = false; // Before submitting, we check if openSelected is true. If true, deselect as needed.
    const clearRestoreAll = document.querySelectorAll(".clearRestore");
    clearRestoreAll.forEach(function (clearRestore) { // Select the "Question Type" & "Number of Choices" so we can hide them
      clearRestore.classList.remove("hidden");
    })

  }
}


function toggleGenerateBtn() {
  generateBtn.toggleAttribute("disabled");
}

function toggleExpl() {
  this.toggleAttribute("hidden");
}

// Submitting the Form to Backend
quizForm.addEventListener("submit", runChecks);

async function runChecks(quizForm) {
  event.preventDefault();
  toggleGenerateBtn();
  // generateBtn.disabled = true;


  // prevent submitting 'Question Type' and 'Number of Choices' when open is selected
  if (openSelected === true) {
    const clearRadioInput = document.querySelectorAll(".clearRadioInput");
    clearRadioInput.forEach(function (clearRadio) { // Select the "Question Type" & "Number of Choices" so we can hide them

      // Run another for loop to uncheck their radio
      const radioElements = clearRadio.querySelectorAll('input[type="radio"]');
      radioElements.forEach(function (radioElement) {
        radioElement.checked = false;
      })

    });

  }


  const formObj = new FormData(document.getElementById("quizForm")); // Getting the form data as an object

  const formData = {};
  for (const [key, value] of formObj.entries()) {
    formData[key] = value;
  }

  console.log(formData);

  const { prompt, type, from, question_type, no_of_choices, no_of_questions, include_explanation, difficulty } = formData; // Destructuring the form Object and adding defaults

  if (prompt === "" || type === "" || from === "" || no_of_questions === "" || include_explanation === "" || difficulty === "") {
    console.warn("Complete All Fields Displayed");
    alert("Complete All Fields Displayed");
    // generateBtn.disabled = false;
    toggleGenerateBtn();

  } else {
    console.log("starting...");


    try {
      await axios.post('http://0.0.0.0:5500/genQuestions', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      })
        .then((response) => {
          console.log(response);
          const generatedQuestions = JSON.parse(response.data.finalModelRes); // Parse the JSON to object
          const quizSection = response.data.quizAppHTML;

          if (response.status === 500) { // Handle unprecedented errors
            alert(response.statusText);
            console.error("Error from server:", response.data.error);
          } else {
            // Handle Success Response
            const headElem = document.querySelector("head");
            const mainForm = document.getElementById("quizForm"); // Gets the form on the page
            const main = document.getElementById("main"); // Gets the main element on the page

            mainForm.classList.toggle("hidden");
            main.insertAdjacentHTML("beforeend", quizSection); // Adds our template from the server
            const quizSectionLinkTag = `<link rel="stylesheet" href= "quiz.css">`

            const questionsSection = document.querySelector(".questionsSection");

            const questionCount = document.querySelector(".questionsSection h3");
            const currentQuestion = document.querySelector(".questionsSection p");
            const questionsLabelContainer = document.querySelector(".questionsSection #subBroadWrapper #selectOptionsContainer");
            const inputNdLabelTemplate = { // For dynamically adding the input and label based on number od choices selected by user
              input: `<input type="radio" class="quizInputs" name="" value="" id="">`,
              label: `<label for="" class="label quizLabels">
                                <span class="option">A</span>
                                <span id="labelTxt">
                                </span>
                            </label>
                            <span class="questionMark" id=""></span>
                            `,
            }
            headElem.insertAdjacentHTML("beforeend", quizSectionLinkTag); // Dynamically add the HTML link tag for changing styling
            let currQuestDisplay = 1; // Tracks the current question being displayed on the page
            let userScore = 0;
            questionCount.textContent = `Q${currQuestDisplay}`;
            currentQuestion.textContent = generatedQuestions.questions[currQuestDisplay - 1].question;

            // Adding the input and label based on number of choices initially stipulated
            const optionsAvailable = formData.no_of_choices; // Number of options selected by user
            console.log(optionsAvailable);

            function selectQuizElements() {

              const quizElements = {
                questionLabels: document.querySelectorAll(".quizLabels"),
                questionInputs: document.querySelectorAll(".quizInputs"),
                labelSpanTxt: document.querySelectorAll(".quizLabels #labelTxt"),
                optionLetter: document.querySelectorAll(".quizLabels .option"),
              }
              return quizElements;
            }

            for (let i = 0; i < optionsAvailable; i++) {
              questionsLabelContainer.insertAdjacentHTML("beforeend", `${inputNdLabelTemplate.input}${inputNdLabelTemplate.label}`);
              const quizElements = selectQuizElements(); // Gets the newly added elements. We do this so as to be able to call it later, outside this loop


              quizElements.optionLetter[i].textContent = i === 0 ? "A" : i === 1 ? "B" : i === 2 ? "C" : i === 3 ? "D" : i === 4 ? "E" : ""; // Ternary operator for controlling Option A to E
              quizElements.questionInputs[i].setAttribute("name", `question${currQuestDisplay}`);
              quizElements.questionInputs[i].setAttribute("id", `option${i + 1}`);
              quizElements.questionLabels[i].setAttribute("for", quizElements.questionInputs[i].id); // Updates the 'for' attribute accordingly
              quizElements.labelSpanTxt[i].textContent = generatedQuestions["questions"][currQuestDisplay - 1]["options"][i];
              quizElements.questionInputs[i].value = quizElements.labelSpanTxt[i].textContent;

            }

            function populateForm() {
              for (let i = 0; i < optionsAvailable; i++) {
                const quizElements = selectQuizElements(); // Gets the newly added elements. We do this so as to be able to call it later, outside this loop

                newAnswerForm.querySelector("#questionCounter").innerHTML = `Q${currQuestDisplay}`;
                newAnswerForm.querySelector("#questionPara").textContent = generatedQuestions.questions[currQuestDisplay - 1].question;

                quizElements.questionInputs[i].setAttribute("name", `question${currQuestDisplay}`);
                quizElements.questionInputs[i].setAttribute("id", `option${i + 1}`);
                quizElements.questionLabels[i].setAttribute("for", quizElements.questionInputs[i].id); // Updates the 'for' attribute accordingly
                quizElements.labelSpanTxt[i].textContent = generatedQuestions["questions"][currQuestDisplay - 1]["options"][i];
                // quizElements.labelSpanTxt[i].style.color = "#131316";
                quizElements.questionInputs[i].value = quizElements.labelSpanTxt[i].textContent;

              }
            }





            // For moving to next question
            const continueBtn = document.getElementById("continueBtn");
            const quizElements = selectQuizElements();




            const newAnswerForm = document.getElementById("newQuizForm"); // gets the template generated
            let showCorrectAns = true; // For tracking if we should populate the quiz form with another question or validate already chosen answer

            const changeLabelOnCheck = newAnswerForm.querySelectorAll("label");
            const changeLabelTxtOnCheck = newAnswerForm.querySelectorAll("label #labelTxt"); // Remove the previous styling from showing the correct answer
            const changeLabelOptOnCheck = newAnswerForm.querySelectorAll("label .option"); 

            changeLabelOnCheck.forEach((label) =>{
              label.addEventListener("change", () => {
                changeLabelTxtOnCheck.forEach((labelTxt) =>{
                    labelTxt.classList.contains("labelTxts") ? labelTxt.classList.remove("labelTxts") : null;
                });

                changeLabelOptOnCheck.forEach((option) =>{
                    option.classList.contains("labelOption") ? option.classList.remove("labelOption") : null;
                })
                
              })
            })

            

            


            newAnswerForm.addEventListener("submit", validateAnswerOrPopulate);

            function validateAnswerOrPopulate() {
              event.preventDefault();

              const newQuizElements = selectQuizElements();

              if (showCorrectAns === true) {

                const quizObject = new FormData(newAnswerForm); // Getting the quiz form data
                const quizData = {};
                for (const [key, value] of quizObject.entries()) {
                  quizData[key] = value;
                }

                console.log(quizData);
                const answerSelectedByUser = quizData[`question${currQuestDisplay}`];
                const correctAnswer = generatedQuestions["questions"][currQuestDisplay - 1]["answer"];

                if (answerSelectedByUser === "") {
                  alert("Select an Option first");
                  return;
                } else { // Here, it means one of the inputs is checked

                  const selectedInputByUser = newAnswerForm.querySelector("input:checked"); // Answer selected by user
                  const selectedLabelByUser = newAnswerForm.querySelector(`label[for="${selectedInputByUser.id}"]`); // Get label that has for = selected input id
                  const selectedLabelSpanText = selectedLabelByUser.querySelector("#labelTxt");
                  const selectedLabelOption = selectedLabelByUser.querySelector(".option");
                  const markQuestions = document.querySelectorAll(".questionMark");
                  let currOption = 1;
                  markQuestions.forEach((mark) => {
                    mark.classList.add(`option${currOption}`);
                    currOption++;
                  })


                  // Disable all Input field
                  newQuizElements.questionInputs.forEach((input) => {
                    input.setAttribute("disabled", true); // Disable ability to select option
                    input.style.cursor = "default";

                    if (input.value === generatedQuestions["questions"][currQuestDisplay - 1]["answer"]) {
                      input.checked = true;
                    }
                  });

                  newQuizElements.questionLabels.forEach((label) => { // newQuizElements refer to the template
                    label.style.cursor = "default";

                  })

                  function giveExplanation() {
                    if (generatedQuestions.explanation === "Yes") {
                      // Append Explanation to Page
                      const explanationSection = document.querySelector(".explanationSection");
                      const explanationParas = explanationSection.querySelector("#explanation");
                      explanationParas.innerHTML = generatedQuestions["questions"][currQuestDisplay - 1]["explanation"];
                      explanationSection.classList.remove("hidden");
                    }
                  }

                  // Mark answer provided
                  if (answerSelectedByUser === correctAnswer) {  // Runs when selected answer matches the correct answer
                    // alert("correct");
                    // selectedInputByUser.checked = false;
                    continueBtn.classList.add("continueBtnCorrect");
                    selectedLabelByUser.classList.add("correctLabelToUser");
                    selectedLabelOption.classList.add("correctLabelOption");

                    markQuestions.forEach((mark) => {
                      if (mark.classList.contains(`${selectedInputByUser.id}`)) {
                        mark.insertAdjacentHTML("beforeend", `<div class="light-green-check">&#10003; Correct Answer</div>`);
                      }
                    });

                    // Unchecks any checked element
                    const correctAnswerForm = document.getElementById("newQuizForm");
                    const allCheckedInput = correctAnswerForm.querySelectorAll("input:checked");
                    allCheckedInput.forEach((checkedInput) =>{ // Uncheck to avoid CSS Specificity problems
                      checkedInput.checked ? checkedInput.checked = false : null;
                    })

                    userScore++;

                    giveExplanation();

                  } else if (answerSelectedByUser !== correctAnswer) {
                    // Mark the selected label wrong
                    // selectedInputByUser.checked = false;
                    continueBtn.classList.add("continueBtnWrong");
                    selectedLabelByUser.classList.add("wrongLabelToUser");
                    selectedLabelOption.classList.add("wrongLabelOption");

                    markQuestions.forEach((mark) => {
                      if (mark.classList.contains(`${selectedInputByUser.id}`)) {
                        mark.insertAdjacentHTML("beforeend", `<div class="light-cross-checkmark">&#10007; Incorrect Answer</div>`)
                      }
                    })

                    // Mark the correct answer
                    const correctAnswerForm = document.getElementById("newQuizForm");
                    const correctAnsShownToUser = correctAnswerForm.querySelector("input:checked");
                    const allCheckedInput = correctAnswerForm.querySelectorAll("input:checked");
                    allCheckedInput.forEach((checkedInput) =>{ // Uncheck to avoid CSS Specificity problems
                      checkedInput.checked ? checkedInput.checked = false : null;
                    });

                    // Uncheck to avoid CSS Specificity problem
                    const correctLabelShownToUser = correctAnswerForm.querySelector(`label[for="${correctAnsShownToUser.id}"]`);
                    
                    const correctLabelShownToUserOption = correctLabelShownToUser.querySelector(".option");

                    correctLabelShownToUser.classList.add("correctLabelToUser"); // change the colors to green et al
                    correctLabelShownToUserOption.classList.add("correctLabelOption");
                    correctLabelShownToUser.insertAdjacentHTML("afterend", `<div class="light-green-check">&#10003; Correct Answer</div>`);



                    giveExplanation();
                  }




                  showCorrectAns = false; // Change the state so that we populate wiht questions next time
                }

              } else { // When showCorrectAns is false, populate with questions on click
                currQuestDisplay++; // Update the Counter to next Question
                if (currQuestDisplay <= generatedQuestions.questions.length) { // Makes sure we still have more questions to display
                  continueBtn.classList.remove("continueBtnCorrect");
                  continueBtn.classList.remove("continueBtnWrong");
                  clearFormData(newAnswerForm);

                  // Next, populate with next question
                  populateForm(newAnswerForm);

                  resetLabel(); // Changes the colors, hopefully


                  showCorrectAns = true;

                } else {
                  // Display Final Quiz Results to User
                  alert(userScore);
                }




              }
            }
          }


          console.log(quizSection);
          console.log("These are the questions generated ", generatedQuestions);
        }




        )
    } catch (error) {
      alert("Oh no! Something Went Wrong. Please Try Again Later");
      console.log(error);
    }

    toggleGenerateBtn();
  }
}


function clearFormData(newAnswerForm) {

  // Clear Question 
  newAnswerForm.querySelector("#questionPara").textContent = "";

  // Clear input values
  for (const input of newAnswerForm.querySelectorAll('input')) {
    if (input.type === 'radio') {
      input.checked = false; // Uncheck
      input.value = ""; // Reset Value
      input.disabled = false; // Re-enable

    }
  }

  // Clear Label
  for (const label of newAnswerForm.querySelectorAll('label')) {
    let option = label.querySelector(".option");
    let labelTxt = label.querySelector("#labelTxt");

    label.classList.contains("correctLabelToUser") ? label.classList.remove("correctLabelToUser") : null;
    label.classList.contains("wrongLabelToUser") ? label.classList.remove("wrongLabelToUser") : null;

    option.classList.contains("wrongLabelOption") ? option.classList.remove("wrongLabelOption") : null;
    option.classList.contains("correctLabelOption") ? option.classList.remove("correctLabelOption") : null;

    
    labelTxt.textContent = ""; // Clear all label span text
    // labelTxt.color = "#fff";
    label.style.cursor = "pointer"; // Take cursors back to pointer
    // label.style.backgroundColor = ""; // Clear them bacnground color
    // option.style.backgroundColor = "rgb(225, 225, 253)";
    // option.style.color = "#131316";

  }

  // const correctLabelSpan = newAnswerForm.querySelector(".correctLabelOption");
  // const wrongLabelSpan = newAnswerForm.querySelector(".wrongLabelOption");
  // // Remove the styling of these option spans (A, B, C, D or E)
  // correctLabelSpan ? correctLabelSpan.classList.remove("correctLabelOption") : null;
  // wrongLabelSpan ? wrongLabelSpan.classList.remove("wrongLabelOption") : null;




  const displayCorrectMarks = newAnswerForm.querySelectorAll(".light-green-check");
  const displayWrongMarks = newAnswerForm.querySelectorAll(".light-cross-checkmark");

  displayCorrectMarks.forEach((displayCorrectMark) => {
    displayCorrectMark.remove(); // Remove this element from page
  })

  displayWrongMarks.forEach((displayCorrectMark) => {
    displayCorrectMark.remove();
  })

  // Hide Explanations
  const expSect = newAnswerForm.querySelector(".explanationSection");
  expSect.classList.add("hidden");


}


function resetLabel() {
  const newQuizForm = document.querySelector("#newQuizForm");

  const labelRadios = newQuizForm.querySelectorAll("label");

  const labelTxts = newQuizForm.querySelectorAll("#labelTxt");

  const optionLabels = newQuizForm.querySelectorAll(".option");


  labelRadios.forEach((label) => {
    label.style.color = "";
    label.style.color = "#fff";
    label.style.backgroundColor = "";
  });


  labelTxts.forEach((labelTxt) => {
    labelTxt.classList.add("labelTxts");
  });

  optionLabels.forEach((option) => {
    option.classList.add("labelOption");
  });

}

  





// For Best Results, indicate the subject you want to generate questions on. E.g; 'Generate questions on Genetics of human leukocytes antigens regions or major histocompatibility complex. The topic is based on Basic Genetics for Medical Students'
