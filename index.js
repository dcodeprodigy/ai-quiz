const promptInput = document.getElementById("promptInput");
        const fromRadios = document.getElementsByName("From");



        // Checks for Updating Placeholder on Input Prompt Accordingly
        fromRadios.forEach(function (radio) {
            radio.addEventListener("change", function(){
                if (radio.checked && radio.value === "Context"){ // Checks in order to update placeholder accordingly
                    promptInput.setAttribute("placeholder", "Please Enter Context for Generating Your Questions")
                } else {
                    promptInput.setAttribute("placeholder", "Please Enter the Topic You Want to Generate Questions On")
                }
            })
                
            }

            )