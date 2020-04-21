//Script to handle functions related to question generation

var variables = [];
/*variables.push({
    "name": "q1var1",
    "min": 0,
    "max": 1,
    "dp": 2
});
variables.push({
    "name": "q1var2",
    "min": 1,
    "max": 2,
    "dp": 1
});
console.log(variables);*/

$(document).ready(function() {
    attachInitListeners();

    progressBtnListeners();

    //Init with one question
    createQuestionContainer();
    incrementCounter();

    //startDownload("test.txt", "test");

});

//Attaches listeners
function attachInitListeners() {
    //Variable stuff
    selectAnswerTypeListener();
    selectVarListener();

    //Questions
    addNewQuestionListener();

    //Answer type listeners

    //Numeric

    //Multiple choice

    //Multiple answer

    //T/F

    //Ordering


    //Download
    downloadQuestionsListener();
}

function roundTo(places, num) {
    return +(Math.round(num + "e+"+places)  + "e-"+places);
}
String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

//Displays the appropriate container for inputting variables
function selectVarListener() {
    $("section.settings > select[name='varType']").on('change', function() {
        var parent = $(this).parent();
        var val = $(this).find(":selected").val().toLowerCase();
        var target = parent.find("article.variable.choose"+val);
        //console.log(target);
        $("article.variable.choose").addClass("hide");
        target.removeClass("hide");

        //Set up random variable interface
        if(val === "rnd") {
            var vcount = parseInt($("article.choose.variable article.variable").length);
            if(vcount < 1) {
                addVariableListener();
                removeVariableListener();
                saveRandomVariablesListener();

                createVariableContainer();
            }
            saveRandomVariables();
        }
        if(val === "csv") {
            getSelectedCSV();
        }
        if(val === "none") {
            $("article.variable.choose").addClass("hide");
        }
    });
}

//Add variable button listener
function addVariableListener() {
    $("article.choose.variable").find("a.button.add").on('click', function() {
        createVariableContainer();
        saveRandomVariables();
    });
}
//Recreates template and adds to markup
function createVariableContainer() {
    var collection = $("article.choose.variable > div.collection");
    //console.log(collection);
    var template = collection.find("template.variable").html();
    //console.log(template);
    collection.append(template);

    //Get indez of this relative to parent
    var index = collection.find("article.variable:last-child").index();
    //change variable value to val+index
    const variablename = collection.find("article.variable:last-child").find("input.var_placeholder");
    variablename.val(variablename.val() + index);

    //Add onchange for save btn
    addVariableOnChangeListener();
}
function addVariableOnChangeListener() {
    var parent = "article.choose.variable > div.collection > article.variable.random:last-child";
    $(parent).find("input").on('keyup', function() {
        setVariablesUnsaved();
    });
}
//Attaches remove button event listener
function removeVariableListener() {
    $("article.choose.variable a.button.remove").on('click', function() {
        var ccount = parseInt($("article.choose.variable article.variable").length);
        //console.log(ccount);
        if(ccount <= 1) {
            alert("You must have at least 1 variable.");
        } else {
            $("article.choose.variable").find("article.variable:last-child").remove();
            saveRandomVariables();
            //decrementCounter();
        }

        //var parent = $(this).parent().remove();
    });
}
function setVariablesUnsaved() {
    var obj = $("article.choose.variable").find("a.button.save");
    obj.find("i").removeClass("fa-check").addClass("fa-times");
}
function setVariablesSaved() {
    var obj = $("article.choose.variable").find("a.button.save");
    obj.find("i").removeClass("fa-times").addClass("fa-check");
}
function saveRandomVariablesListener() {
    $("a.button.save").on('click', function() {
        saveRandomVariables();
    });
}
function saveRandomVariables() {
    //console.log("Variable containers:");
    variables = [];
    $("article.variable.random").each(function() {
        //console.log($(this));
        var temp = {
            "name": $(this).find("input.var_placeholder").val(),
            "min": $(this).find("input[name='min']").val(),
            "max": $(this).find("input[name='max']").val(),
            "dp": $(this).find("input[name='decimal']").val()
        };
        variables.push(temp);
    });
    console.log("Save success:");
    console.log(variables);
    setVariablesSaved();
}
function getSelectedCSV() {
    $("input.csv").unbind();
    $("input.csv").on('change', function(e) {
        var file = e.target.files[0];
        //Reads and saves content
        var content = readFile(file);
    });
}
function parseCSVtoObj(content) {
    //Empty variables
    variables = [];

    //Split array at new lines
    var arr = content.split("\n");
    //For each line
    arr.forEach(function(self) {
        //If empty
        if(self.length === 0) {
            //skip if empty
            return;
        } else {
        //If not empty, break at , delimiters, construct obj and push onto arr of objs
            var items = self.split(",");
            var temp = {
                "name": items[0],
                "min": items[1],
                "max": items[2],
                "dp": items[3]
            }
            variables.push(temp);
        }
    });
    console.log("CSV is saved for use:");
    console.log(variables);
}
function readFile(file) {
    if(file) {
        var freader = new FileReader();

        freader.onload = function(evt) {
            console.log("File is read, content:");
            console.log(evt.target.result);
            //return evt.target.result;
            parseCSVtoObj(evt.target.result);

            $("article.choosecsv p.note").removeClass("success").removeClass("error");
            $("article.choosecsv p.note").html("CSV file loaded. You may now use them as variables.").addClass("success");
            $("article.choosecsv article.notice.csv").html(returnCSVPreview());
        }
        freader.error = function(evt) {
            //alert("Error reading CSV file. Please try again.");
            $("article.choosecsv p.note").removeClass("success").removeClass("error");
            $("article.choosecsv p.note").html("Error reading the CSV file. Please try again.").addClass("error");
        }
        freader.readAsText(file);
    }
}
function returnCSVPreview() {
    var markup = "<table><caption>Your CSV file</caption>";
    markup += "<thead><tr><th>Var name</th><th>Min val</th><th>Max val</th><th>D.p</th></thead>";
    markup += "<tbody>";
    variables.forEach(function(self) {
        markup += "<tr><td>" + self["name"] + "</td>";
        markup += "<td>" + self["min"] + "</td>";
        markup += "<td>" + self["max"] + "</td>";
        markup += "<td>" + self["dp"] + "</td>";
        markup += "</tr>";
    });
    markup += "</tbody></table>";
    return markup;
}
function updateMathContent(s) {
   //var math = MathJax.Hub.getAllJax(s)[0];
   //var math =
   MathJax.Hub.Queue(["Typeset", MathJax.Hub, s]);
}

function attachTextareaListener() {
    //Question to be copied over to the preview
    //Need to process variables
    var delaytime = 225;
    $("section.question:last-child article.edit_question textarea.edit").on('keyup', delay(function(e) {
        showPreview($(this));
    }, delaytime));
    $("section.question:last-child article.edit_incorr_feedback textarea.edit").on('keyup', delay(function(e) {
        showPreview($(this));
    }, delaytime));
    $("section.question:last-child article.edit_corr_feedback textarea.edit").on('keyup', delay(function(e) {
        showPreview($(this));
    }, delaytime));
}

//Used for delaying keyup event processing
function delay(callback, ms) {
  var timer = 0;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback.apply(context, args);
    }, ms || 0);
  };
}

//Set textarea preview content
function showPreview(fromObj) {
    var parent = fromObj.parent().parent();
    var value = fromObj.val();

    var found = false;

    //If any variables are found in this string, then
    //generate number and replace all instances
    variables.forEach(function(self) {
        var contains = value.indexOf("{{" + self["name"] + "}}");
        if(contains != -1) {
            found = true;
            var num = generateRandomVar(self);
            //console.log(num);

            value = value.replaceAll("{{" + self["name"] + "}}", "$$" + num + "$$");
        }
    });

    //Set preview
    //Call MathJax to re-process this
    parent.find("div.preview p").html(value);
    var container = parent.find("div.preview p")[0];
    if(found === true || value.indexOf("$$") != -1) {
        updateMathContent(container);
    }
}
function showNumericAnswerPreview(self) {
    //Parent, article#num
    var parent = self.parent().parent();
    //Numerical answer
    var answer = parent.find("textarea[name='numericAnswer']").val();
    //Accepted answer deviation
    var error = parseInt(parent.find("textarea[name='acceptedError']").val());


    const plusminus = "±";
    //Jquery obj
    const preview = parent.find("div.preview p");
    //Pure JS obj for MathJax
    const previewMath = parent.find("div.preview p")[0];

    //If accepted error is a number, then we display it as plus minus
    if(!isNaN(error)) {
        preview.html(answer + " " + plusminus + " " + error);
        //If error is NAN, that means we have no numerics so we dont display it
    } else {
        preview.html(answer);
    }
    //Then look through with mathjax
    updateMathContent(previewMath);

}
function addPreviewListener(q) {

    const delaytime = 200;

    //Remove first to avoid errors
    q.find("article#num textarea[name='numericAnswer']").unbind();
    q.find("article#num textarea[name='acceptedError']").unbind();
    //Attach delayed keyup events
    q.find("article#num textarea[name='numericAnswer']").on('keyup', delay(function() {
        showNumericAnswerPreview($(this));
    }, delaytime));
    q.find("article#num textarea[name='acceptedError']").on('keyup', delay(function() {
        showNumericAnswerPreview($(this));
    }, delaytime));
}
function generateRandomVar(obj) {
    var num = Math.random() * (obj["max"] - obj["min"]) + obj["min"];
    var num = roundTo(parseInt(obj["dp"]), num);
    return num;
}

//Initialises answer type container when chosen
function initAnswerType(val, self) {
    if(val === "num") {
        addPreviewListener(self);
    }
    if(val === "mc") {

        var count = parseInt(self.find("article#mc div.choice").length);
        if(count < 1) {
            addNewChoiceListener(self);
            createMCContainer(self);
        }
    }
    if(val === "ma") {

        var count = parseInt(self.find("article#ma div.manswer").length);
        if(count < 1) {
            addNewAnswerListener(self);
            createMAContainer(self);
        }
    }
    if(val === "tf") {
        attachTFRadioListener(self);
    }
    if(val === "ess") {

    }
    if(val === "ord") {
        orderingListener(self);
    }
}

//Adds functionality to "Add question" button
function addNewQuestionListener() {
    $("section.questions > article.questionCounter a.button.add.question").on('click', function() {
        createQuestionContainer();
        incrementCounter();
    });
}
//Remove this question listener
function removeThisQuestionListener() {
    $("section.question:last-child a.button.remove").on('click', function() {
        var qcount = parseInt($("span#questionNum").text());
        if(qcount <= 1) {
            alert("You must have at least 1 question.");
        } else {
            $(this).parent().parent().remove();
            decrementCounter();
        }
    });
}
//Collapse event listener
function collapseQuestionListener() {
    $("section.question:last-child a.button.collapse").on('click', function() {
        $(this).parent().parent().find("div.question.body").slideToggle();
        /*
        $("a.button.collapse > i").removeClass("fa-toggle-on");
        $("a.button.collapse > i").addClass("fa-toggle-off");
        */
    });
}

//Increments <span> element when new question is added to keep track
function getCounter() {
    var counterObj = $("section.questions").find("span#questionNum");
    var val = parseInt(counterObj.text());
    return {elem: counterObj, value: val};
}
function incrementCounter() {
    var counter = getCounter();
    counter.elem.text(counter.value+1);
}
function decrementCounter() {
    var counter = getCounter();
    counter.elem.text(counter.value-1);
}

//Copies question container from template and attaches event listeners
function createQuestionContainer() {
    //Append to article.collection
    //Clone article.collection > section.question
    var collection = $("article.collection");
    var template = collection.find("template.template.question").html();
    //console.log(template);
    collection.append(template);

    //Then add event listener(s) as template doesnt retain them
    selectAnswerTypeListener();
    removeThisQuestionListener();
    collapseQuestionListener();
    attachTextareaListener();
}

//Creates extra line for multiple choice answer
function createMCContainer(self) {
    var collection = self.find("article#mc > aside.addChoice");
    //console.log(collection);
    var template = collection.find("template.choice").html();
    //console.log(template);
    collection.append(template);

    removeThisChoiceListener(self);
}
function removeThisChoiceListener(self) {
    self.find("div.choice:last-child a.button.remove").on('click', function() {
        var ccount = parseInt(self.find("aside.addChoice > div.choice").length);
        if(ccount <= 1) {
            alert("You must have at least 1 choice.");
        } else {
            $(this).parent().parent().remove();
            //decrementCounter();
        }

        //var parent = $(this).parent().remove();
    });
}
function addNewChoiceListener(self) {
    self.find("article#mc").find("a.button.add").on('click', function() {
        createMCContainer(self);
    });
}

//Mutiple answers
function createMAContainer(self) {
    var collection = self.find("article#ma > aside.addChoice");
    //console.log(collection);
    var template = collection.find("template.manswer").html();
    //console.log(template);
    collection.append(template);

    removeThisAnswerListener(self);
}
function removeThisAnswerListener(self) {
    self.find("div.choice:last-child a.button.remove").on('click', function() {
        var ccount = parseInt(self.find("aside.addChoice div.choice").length);
        if(ccount <= 1) {
            alert("You must have at least 1 answer.");
        } else {
            $(this).parent().parent().remove();
            //decrementCounter();
        }

        //var parent = $(this).parent().remove();
    });
}
function addNewAnswerListener(self) {
    self.find("article#ma").find("a.button.add").on('click', function() {
        createMAContainer(self);
    });
}

//True or false
function attachTFRadioListener(self) {
    self.find("article#tf input.tfradio").unbind("click");
    var index = self.parent().index();
    self.find("article#tf input.tfradio.true").attr("name", "true"+index);
    self.find("article#tf input.tfradio.false").attr("name", "false"+index);

    self.find("article#tf input.tfradio").on('click', function(e) {
        //$(this).siblings().find("input").prop('checked', false);
        self.find("article#tf input.tfradio").prop('checked', false);
        $(this).prop('checked', true);

    });
}

//Shows the appropriate container for each question
function selectAnswerTypeListener() {
    $("section.question:last-child select[name='answerType']").on('change', function() {
        var parent = $(this).parent();
        //This is used for the id of target container
        var val = $(this).find(":selected").val().toLowerCase();
        //Find target, hide all siblings then show
        var target = parent.find("article#answerContainer > article#"+val);
        target.siblings().addClass("hide");
        target.removeClass("hide");
        //Now set up this container
        initAnswerType(val, parent);
    });
}

function orderingListener(self) {
    self.find("a.button.add.order").unbind('click');
    self.find("a.button.remove.order").unbind('click');

    //Adding new option
    self.find("a.button.add.order").on('click', function() {
        var collection = self.find("article#ord > section.answers");
        //console.log(collection);
        var template = collection.find("template.ordering").html();
        //console.log(template);
        collection.append(template);

        //Attach ordering listener
        orderingArrowsListener(self);
    });
    //Remove last option (last child)
    self.find("a.button.remove.order").on('click', function() {
        var ccount = parseInt(self.find("article#ord > section.answers > div.orderOption").length);
        //console.log(ccount);
        if(ccount <= 1) {
            alert("You must have at least 1 answer.");
        } else {
            $(this).parent().parent().find("section.answers div.orderOption:last-child").remove();
            //decrementCounter();
        }

        //var parent = $(this).parent().remove();
    });

}
function orderingArrowsListener(self) {
    //Up arrow
    self.find("div.orderOption:last-child i.fa-chevron-up").on('click', function() {
        var thisQ = $(this).closest("section.question");
        //Get how many there are, the container and index of this relative to parent
        const numberOfOptions = parseInt(thisQ.find("section.answers > div.orderOption").length);
        const container = $(this).parent();
        var index = container.index();
        //If in first place, cancel
        if(index === 1) {
            return false;
        }
        //Else take off from index and prepend before that
        var before = index - 2;
        /*console.log($("section.answers > div.orderOption:eq("+before+")"));
        console.log("index:" + $(this).parent().index());*/

        thisQ.find("section.answers > div.orderOption:eq("+before+")").before(container);
    });

    //Down arrow
    self.find("div.orderOption:last-child i.fa-chevron-down").on('click', function() {
        var thisQ = $(this).closest("section.question");

        const numberOfOptions = parseInt(thisQ.find("section.answers > div.orderOption").length);
        const container = $(this).parent();
        var index = container.index();
        //If this is the last one
        if(index === numberOfOptions) {
            return false;
        }
        //console.log($("section.answers > div.orderOption:eq("+index+")"));
        //Else, just append self after itself
        thisQ.find("section.answers > div.orderOption:eq("+index+")").after(container);
    });
}

//Download functions
function generateTextFile() {
    //Doc: https://help.blackboard.com/Learn/Instructor/Tests_Pools_Surveys/Reuse_Questions/Upload_Questions
    var content = "";
    const tab = "\t";
    const linebr = "\r\n";
    $("section.question").each(function() {
        //Examine type of question
        var type = getAnswerType($(this));
        if(!type) {
            //Type is null, decide what to do
            //Maybe count errors and report at the end?
            return false;
        }
        var question = getQuestion($(this));
        if(!question) {
            //If is null
            return false;
        }

        //Now evaluate different types of questions and write them
        if(type === "NUM") {
            var answer = $(this).find('textarea[name="numericAnswer"]').val();
            var tolerance = $(this).find('textarea[name="acceptedError"]').val();
            if(!answer || !tolerance) {
                return false;
            }
            content += type + tab + question + tab + answer + tab + tolerance + linebr;
        }
        if(type === "MC") {
            var line = type + tab + question;
            $(this).find("div.choice").each(function() {
                var val = $(this).find('input[name="answer"]').val();
                var state = "incorrect";
                if($(this).find('input[name="correct"]').is(":checked")) {
                    var state = "correct";
                }
                line += tab + val + tab + state;
            });
            content += line + linebr;
        }
        if(type === "MA") {
            var line = type + tab + question;
            $(this).find("div.manswer").each(function() {
                var val = $(this).find('input[name="answer"]').val();
                var state = "incorrect";
                if($(this).find('input[name="choice"]').is(":checked")) {
                    var state = "correct";
                }
                line += tab + val + tab + state;
            });
            content += line + linebr;
        }
        if(type === "TF") {
            var state = "false";
            $(this).find(".tfradio.true").is(":checked") ? state = "true" : $(this).find(".tfradio.false").is(":checked") ? state = "false" : state = "null";

            content += type + tab + question + tab + state + linebr;
        }
        if(type === "ESS") {

        }
        if(type === "ORD") {
            var line = type + tab + question;

            var collection = $(this).find("div.orderOption");
            collection.each(function() {
                var text = $(this).find("input[name='orderValue']").val();
                line += tab + text;
            });
            content += line;
        }
    });
    return content;
}


function progressBtnListeners() {
    $("a.save.prog").on('click', function() {
        saveProgress();
        console.log('click');
    });
    $("a.import.prog").on('click', function() {
        importProgress();
    });
}
function saveProgress() {
    var json = {};
    json['questions'] = [];

    var pool = {};
    var cont = $("article.poolSettings");
    pool['title'] = cont.find("input.poolTitle").val();
    pool['desc'] = cont.find("input.poolDesc").val();
    pool['instructions'] = cont.find("input.poolInstructions").val();
    json['pool'] = pool;

    $("section.question").each(function() {
        var temp = {};
        temp['question'] = getQuestion($(this));
        temp['incorrect'] = getIncorrFeedback($(this));
        temp['correct'] = getCorrFeedback($(this));
        temp['type'] = getAnswerType($(this));

        switch(temp['type']) {
            case "NUM":
                var ans = {};
                ans['answer'] = $(this).find("textarea[name='numericAnswer']").val();
                ans['error'] = $(this).find("textarea[name='acceptedError']").val();

                temp['answer'] = ans;
                break;
            case "MA":
                var ans = [];
                $(this).find("article#ma").find("div.choice").each(function() {
                    var obj = {};
                    obj['value'] = $(this).find("input[name='answer']").val();
                    obj['correct'] = $(this).find("input[name='correct']").is(":checked");
                    ans.push(obj);
                });
                temp['answer'] = ans;
                break;
            case "MC":
                var ans = [];
                $(this).find("article#mc").find("div.choice").each(function() {
                    var obj = {};
                    obj['value'] = $(this).find("input[name='answer']").val();
                    obj['correct'] = $(this).find("input[name='correct']").is(":checked");
                    ans.push(obj);
                });
                temp['answer'] = ans;
                break;
            case "ORD":
                var ans = [];
                $(this).find("article#ord").find("div.orderOption").each(function() {
                    ans.push($(this).find("input[name='orderValue']").val());
                });
                temp['answer'] = ans;
                break;
            case "TF":
                var ans = {};
                ans['answer'] = $(this).find("input.tfradio:checked").val().toLowerCase();
                temp['answer'] = ans;
                break;
            default:
                console.log("Answer type not known");
        }

        json['questions'].push(temp);
    });

    console.log(JSON.stringify(json));
}
function importProgress() {

}


function getAnswerType(elem) {
    try {
        return elem.find('select[name="answerType"]').val().toUpperCase();
    } catch {
        return null;
    }
}
function getQuestion(elem) {
    var text = elem.find('textarea[name="editQuestion"]').val();
    if(text.length === 0) {
        return null;
    } else {
        return text;
    }
}
function getCorrFeedback(question) {
    return question.find('textarea[name="editCorrFeedback"]').val();
}
function getIncorrFeedback(question) {
    return question.find('textarea[name="editIncorrFeedback"]').val();
}
function startDownload(filename, content) {
    //Create a tag, attach download, click it then remove
    let element = $("<a></a>");
    element.attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.attr('download', filename);

    $(element).hide();
    $("body").append(element);

    element.get(0).click();

    $(element).remove();
}
function downloadQuestionsListener() {
    $("a.button.generate.questions").on('click', function() {
        downloadQuestions();
    });
    $("a.button.generate.pool").on('click', function() {
        downloadPool();
    });
}


//Download the pool
function getPoolTitle() {
    return $("article.poolSettings input[name='title']").val();
}
function getPoolDesc() {
    return $("article.poolSettings input[name='desc']").val();
}
function getPoolInst() {
    return $("article.poolSettings input[name='instructions']").val();
}

function returnMainDat() {
    const assmd = `<assessmentmetadata>
        <bbmd_asi_object_id>_346625_1</bbmd_asi_object_id>
        <bbmd_asitype>Assessment</bbmd_asitype>
        <bbmd_assessmenttype>Pool</bbmd_assessmenttype>
        <bbmd_sectiontype>Subsection</bbmd_sectiontype>
        <bbmd_questiontype>Multiple Choice</bbmd_questiontype>
        <bbmd_is_from_cartridge>false</bbmd_is_from_cartridge>
        <bbmd_is_disabled>false</bbmd_is_disabled>
        <bbmd_negative_points_ind>N</bbmd_negative_points_ind>
        <bbmd_canvas_fullcrdt_ind>false</bbmd_canvas_fullcrdt_ind>
        <bbmd_all_fullcredit_ind>false</bbmd_all_fullcredit_ind>
        <bbmd_numbertype>none</bbmd_numbertype>
        <bbmd_partialcredit></bbmd_partialcredit>
        <bbmd_orientationtype>vertical</bbmd_orientationtype>
        <bbmd_is_extracredit>false</bbmd_is_extracredit>
        <qmd_absolutescore_max>15.0</qmd_absolutescore_max>
        <qmd_weighting>0.0</qmd_weighting>
        <qmd_instructornotes></qmd_instructornotes>
    </assessmentmetadata>`;

    const poolTitle = getPoolTitle();
    const poolDesc = getPoolDesc();
    const poolInst = getPoolInst();

    const linebr = "\r\n";
    var content = '<?xml version="1.0" encoding="UTF-8"?><questestinterop><assessment title="'+ poolTitle + '">';
    //Metadata then instructions and description
    content += assmd;
    content += `<rubric view="All">
        <flow_mat class="Block">
            <material>
                <mat_extension>
                    <mat_formattedtext type="HTML">&lt;p&gt;`+ poolInst + `&lt;/p&gt;</mat_formattedtext>
                </mat_extension>
            </material>
        </flow_mat>
    </rubric>`;
    content += `<presentation_material>
        <flow_mat class="Block">
            <material>
                <mat_extension>
                    <mat_formattedtext type="HTML">&lt;p&gt;`+poolDesc+`&lt;/p&gt;</mat_formattedtext>
                </mat_extension>
            </material>
        </flow_mat>
    </presentation_material>`;
    content += "<section>";

    //Different metadata for section
    var secmd = assmd;
    secmd = secmd.replaceAll("assessmentmetadata", "sectionmetadata");
    secmd = secmd.replaceAll("Assessment", "section");
    //assessmentmetadata - > sectionmetadata
    //Assessment -> Section
    content += secmd;

    var itemmd = `<itemmetadata>
        <bbmd_asi_object_id>_346627_1</bbmd_asi_object_id>
        <bbmd_asitype>Item</bbmd_asitype>
        <bbmd_assessmenttype>Pool</bbmd_assessmenttype>
        <bbmd_sectiontype>Subsection</bbmd_sectiontype>
        <bbmd_questiontype>Numeric</bbmd_questiontype>
        <bbmd_is_from_cartridge>false</bbmd_is_from_cartridge>
        <bbmd_is_disabled>false</bbmd_is_disabled>
        <bbmd_negative_points_ind>N</bbmd_negative_points_ind>
        <bbmd_canvas_fullcrdt_ind>false</bbmd_canvas_fullcrdt_ind>
        <bbmd_all_fullcredit_ind>false</bbmd_all_fullcredit_ind>
        <bbmd_numbertype>none</bbmd_numbertype>
        <bbmd_partialcredit>false</bbmd_partialcredit>
        <bbmd_orientationtype>vertical</bbmd_orientationtype>
        <bbmd_is_extracredit>false</bbmd_is_extracredit>
        <qmd_absolutescore_max>-1.0</qmd_absolutescore_max>
        <qmd_weighting>0.0</qmd_weighting>
        <qmd_instructornotes></qmd_instructornotes>
    </itemmetadata>`;
    var qheader = `<flow class="QUESTION_BLOCK">
        <flow class="FORMATTED_TEXT_BLOCK">
            <material>
                <mat_extension>
                    <mat_formattedtext type="HTML">&lt;p&gt;QUESTION&lt;/p&gt;</mat_formattedtext>
                </mat_extension>
            </material>
        </flow>
    </flow>`;
    var qFeedback = `<itemfeedback ident="correct" view="All">
        <flow_mat class="Block">
            <flow_mat class="FORMATTED_TEXT_BLOCK">
                <material>
                    <mat_extension>
                        <mat_formattedtext type="HTML">&lt;p&gt;FEEDBACK&lt;/p&gt;</mat_formattedtext>
                    </mat_extension>
                </material>
            </flow_mat>
        </flow_mat>
    </itemfeedback>`;

    //Start defining questions
    $("section.question").each(function() {
        //This question item's variable
        var temp = '<item title="" maxattempts="0">';

        var answers = [];
        var type = $(this).find("select[name='answerType']").val();
        //Used in dat file
        var longType = "";
        //TODO: Investigate and change response block for different answer types
        var responseBlock = '<flow class="RESPONSE_BLOCK">';

        //Define question part first and work out RESPONSE_BLOCK
        switch(type) {
            case "NUM":
                longType = "Numeric";
                responseBlock += '<response_num ident="response" rcardinality="Single" rtiming="No"><render_fib charset="us-ascii" encoding="UTF_8" rows="0" columns="0" maxchars="0" prompt="Box" fibtype="Decimal" minnumber="0" maxnumber="0"/></response_num>';
                break;
            case "MC":
                longType = "Multiple Choice";
                responseBlock += `<response_lid ident="response" rcardinality="Single" rtiming="No">
                    <render_choice shuffle="No" minnumber="0" maxnumber="0">`;
                //Then same as MA
                var sampleBlock = `<flow_label class="Block">
                    <response_label ident="HASH" shuffle="Yes" rarea="Ellipse" rrange="Exact">
                        <flow_mat class="FORMATTED_TEXT_BLOCK">
                            <material>
                                <mat_extension>
                                    <mat_formattedtext type="HTML">&lt;p&gt;ANS&lt;/p&gt;</mat_formattedtext>
                                </mat_extension>
                            </material>
                        </flow_mat>
                    </response_label>
                </flow_label>`;

                answers = [];
                $(this).find("div.choice").each(function() {
                    var tempobj = {};
                    tempobj['answer'] = $(this).find("input[name='answer']").val();
                    tempobj['correct'] = $(this).find("input[type='checkbox']").is(":checked");
                    tempobj['hash'] = hex_md5(tempobj['answer']);
                    answers.push(tempobj);

                    var tempblock = sampleBlock.replace("HASH", tempobj['hash']);
                    tempblock = tempblock.replace("ANS", tempobj['answer']);

                    responseBlock += tempblock;
                });
                responseBlock += "</render_choice></response_lid>";
                break;
            case "MA":
                longType = "Multiple Answer";
                responseBlock += `<response_lid ident="response" rcardinality="Multiple" rtiming="No">
                    <render_choice shuffle="No" minnumber="0" maxnumber="0">`;
                //Now for each answer generate hash and its block
                var sampleBlock = `<flow_label class="Block">
                    <response_label ident="HASH" shuffle="Yes" rarea="Ellipse" rrange="Exact">
                        <flow_mat class="FORMATTED_TEXT_BLOCK">
                            <material>
                                <mat_extension>
                                    <mat_formattedtext type="HTML">&lt;p&gt;ANS&lt;/p&gt;</mat_formattedtext>
                                </mat_extension>
                            </material>
                        </flow_mat>
                    </response_label>
                </flow_label>`;

                answers = [];
                $(this).find("div.manswer").each(function() {
                    var tempobj = {};
                    tempobj['answer'] = $(this).find("input[name='answer']").val();
                    tempobj['correct'] = $(this).find("input[name='choice']").is(":checked");
                    tempobj['hash'] = hex_md5(tempobj['answer']);
                    answers.push(tempobj);

                    var tempblock = sampleBlock.replace("HASH", tempobj['hash']);
                    tempblock = tempblock.replace("ANS", tempobj['answer']);

                    responseBlock += tempblock;

                });
                console.log(answers);

                responseBlock += "</render_choice></response_lid>";

                break;
            case "TF":
                longType = "True/False";

                responseBlock += `<response_lid ident="response" rcardinality="Single" rtiming="No">
                    <render_choice shuffle="No" minnumber="0" maxnumber="0">
                        <flow_label class="Block">
                            <response_label ident="true" shuffle="Yes" rarea="Ellipse" rrange="Exact">
                                <flow_mat class="Block">
                                    <material>
                                        <mattext charset="us-ascii" texttype="text/plain" xml:space="default">true</mattext>
                                    </material>
                                </flow_mat>
                            </response_label>
                            <response_label ident="false" shuffle="Yes" rarea="Ellipse" rrange="Exact">
                                <flow_mat class="Block">
                                    <material>
                                        <mattext charset="us-ascii" texttype="text/plain" xml:space="default">false</mattext>
                                    </material>
                                </flow_mat>
                            </response_label>
                        </flow_label>
                    </render_choice>
                </response_lid>`;
                break;
            case "ORD":
                longType = "Ordering";
                responseBlock += `<response_lid ident="response" rcardinality="Ordered" rtiming="No">
                <render_choice shuffle="No" minnumber="0" maxnumber="0">`;

                var sample = `<flow_label class="Block">
                <response_label ident="HASH" shuffle="Yes" rarea="Ellipse" rrange="Exact">
                <flow_mat class="FORMATTED_TEXT_BLOCK">
                <material>
                <mat_extension>
                <mat_formattedtext type="HTML">&lt;p&gt;ANS&lt;/p&gt;</mat_formattedtext>
                </mat_extension>
                </material>
                </flow_mat>
                </response_label>
                </flow_label>`;

                answers = [];
                $(this).find("div.orderOption").each(function() {
                    var tempobj = {};
                    tempobj['answer'] = $(this).find("input[name='orderValue']").val();
                    tempobj['hash'] = hex_md5(tempobj['answer']);
                    tempobj['order'] = $(this).index();
                    answers.push(tempobj);

                    var temp = sample.replace("ANS", tempobj['answer']);
                    temp = temp.replace("HASH", tempobj['hash']);
                    responseBlock += temp;
                });

                responseBlock += `</render_choice>
            </response_lid>`;

                break;
            default:
                console.log("Type unknown");
        }
        responseBlock += '</flow>';

        var item = itemmd.replace("Numeric", longType);
        temp += item;

        var mathjax = '&lt;script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML" async&gt;&lt;/script&gt;';
        var qhead = qheader.replace("&lt;p&gt;QUESTION&lt;/p&gt;", mathjax + "&lt;p&gt;" + getQuestion($(this)) + "&lt;/p&gt;");

        temp += '<presentation><flow class="Block">' + qhead + responseBlock + '</flow></presentation>';

        //Then work out scoring
        switch(type) {
            case "NUM":
                temp += `<resprocessing scoremodel="SumOfScores">
                <outcomes><decvar varname="SCORE" vartype="Decimal" defaultval="0.0" minvalue="0.0" maxvalue="5.0"/></outcomes>
                <respcondition title="HASH">
                <conditionvar>
                <vargte respident="response">4.0</vargte>
                <varlte respident="response">4.0</varlte>
                <varequal respident="response" case="No">4.0</varequal>
                </conditionvar><displayfeedback linkrefid="correct" feedbacktype="Response"/></respcondition>
                <respcondition title="incorrect">
                <conditionvar><other/></conditionvar>
                <setvar variablename="SCORE" action="Set">0.0</setvar><displayfeedback linkrefid="incorrect" feedbacktype="Response"/></respcondition>
                </resprocessing>`;
                break;
            case "MA":
                var start = `<resprocessing scoremodel="SumOfScores">
                    <outcomes><decvar varname="SCORE" vartype="Decimal" defaultval="0.0" minvalue="0.0"/></outcomes>
                    <respcondition title="correct">
                        <conditionvar>
                            <and>`;
                answers.forEach(function(arr) {
                    if(arr['correct']) {
                        start += '<varequal respident="response" case="No">'+arr['hash']+'</varequal>';
                    } else {
                        start += '<not><varequal respident="response" case="No">'+arr['hash']+'</varequal></not>';
                    }
                });
                start += `</conditionvar>
                <setvar variablename="SCORE" action="Set">SCORE.max</setvar><displayfeedback linkrefid="correct" feedbacktype="Response"/></respcondition>
            <respcondition title="incorrect">
                <conditionvar><other/></conditionvar>
                <setvar variablename="SCORE" action="Set">0.0</setvar><displayfeedback linkrefid="incorrect" feedbacktype="Response"/></respcondition>`;
                answers.forEach(function(arr) {
                    start += `<respcondition>
                        <conditionvar><varequal respident="`+arr['hash']+`" case="No"/></conditionvar>
                        <setvar variablename="SCORE" action="Set">0</setvar>
                    </respcondition>`;
                });
                start += "</resprocessing>";

                temp += start;
                break;
            case "MC":
                var start = `<resprocessing scoremodel="SumOfScores">
                    <outcomes><decvar varname="SCORE" vartype="Decimal" defaultval="0.0" minvalue="0.0"/></outcomes>
                    <respcondition title="correct">
                        <conditionvar>`;
                answers.forEach(function(arr) {
                    if(arr['correct']) {
                        start += '<varequal respident="response" case="No">'+arr['hash']+'</varequal></conditionvar>';
                        start += '<setvar variablename="SCORE" action="Set">SCORE.max</setvar><displayfeedback linkrefid="correct" feedbacktype="Response"/></respcondition>';
                        start += `<respcondition title="incorrect">
                            <conditionvar><other/></conditionvar>
                            <setvar variablename="SCORE" action="Set">0.0</setvar><displayfeedback linkrefid="incorrect" feedbacktype="Response"/></respcondition>`;

                    }
                });
                answers.forEach(function(arr) {
                    var sample = `<respcondition>
                        <conditionvar><varequal respident="HASH" case="No"/></conditionvar>
                        <setvar variablename="SCORE" action="Set">SETSCORE</setvar><displayfeedback linkrefid="HASH" feedbacktype="Response"/></respcondition>`;

                    sample = sample.replaceAll("HASH", arr['hash']);
                    if(arr['correct']) {
                        sample = sample.replace("SETSCORE", 100);
                    } else {
                        sample = sample.replace("SETSCORE", 0);
                    }
                    start += sample;
                });
                start += "</resprocessing>";

                temp += start;
                break;
            case "TF":
                var state = $(this).find("input.tfradio:checked").val().toLowerCase();
                temp += `<resprocessing scoremodel="SumOfScores">
                    <outcomes><decvar varname="SCORE" vartype="Decimal" defaultval="0.0" minvalue="0.0"/></outcomes>
                    <respcondition title="correct">
                        <conditionvar>
                            <varequal respident="response" case="No">`+ state +`</varequal>
                        </conditionvar>
                        <setvar variablename="SCORE" action="Set">SCORE.max</setvar><displayfeedback linkrefid="correct" feedbacktype="Response"/></respcondition>
                    <respcondition title="incorrect">
                        <conditionvar><other/></conditionvar>
                        <setvar variablename="SCORE" action="Set">0.0</setvar><displayfeedback linkrefid="incorrect" feedbacktype="Response"/></respcondition>
                </resprocessing>`;
                break;
            case "ORD":
                var ansline = '<varequal respident="response" case="No">HASH</varequal>';
                var sampleStart = `<resprocessing scoremodel="SumOfScores">
                    <outcomes><decvar varname="SCORE" vartype="Decimal" defaultval="0.0" minvalue="0.0"/></outcomes>
                    <respcondition title="correct">
                        <conditionvar>
                            <and>`;
                var sampleEnd = `</and>
                        </conditionvar>
                        <setvar variablename="SCORE" action="Set">SCORE.max</setvar><displayfeedback linkrefid="correct" feedbacktype="Response"/></respcondition>
                    <respcondition title="incorrect">
                        <conditionvar><other/></conditionvar>
                        <setvar variablename="SCORE" action="Set">0.0</setvar><displayfeedback linkrefid="incorrect" feedbacktype="Response"/></respcondition>
                </resprocessing>`;

                temp += sampleStart;
                answers.forEach(function(arr) {
                    var answer = ansline.replace("HASH", arr['hash']);
                    temp += answer;
                });
                temp+= sampleEnd;

                break;
        }


        //Standard incorrect and correct feedback, then question specific feedback
        //Correct
        var feedback = qFeedback.replace("FEEDBACK", getCorrFeedback($(this)));
        temp += feedback;
        //Incorrect
        feedback = qFeedback.replace("correct", "incorrect");
        feedback = feedback.replace("FEEDBACK", getIncorrFeedback($(this)));
        temp += feedback;

        //Individual feedback block after correcet/incorr feedback
        switch(type) {
            case "NUM":
                break;
            case "MC":
                var sample = `<itemfeedback ident="HASH" view="All">
                    <solution view="All" feedbackstyle="Complete">
                        <solutionmaterial>
                            <flow_mat class="Block">
                                <flow_mat class="FORMATTED_TEXT_BLOCK">
                                    <material>
                                        <mat_extension><mat_formattedtext type="HTML"/></mat_extension>
                                    </material>
                                </flow_mat>
                            </flow_mat>
                        </solutionmaterial>
                    </solution>
                </itemfeedback>`;
                answers.forEach(function(arr) {
                    temp += sample.replace("HASH", arr['hash']);
                });
                //Dont break so it runs the same for MA
                //Fallthrough
                //break;
            case "MA":

                break;
        }

        temp += "</item>";

        //Add this question to content
        content += temp;

        //Next question
    });

    content += "</section></assessment></questestinterop>";

    return content;
}

function downloadPool() {
    var zip = new JSZip();

    const poolTitle = getPoolTitle();

    zip.file("imsmanifest.xml", '<?xml version="1.0" encoding="UTF-8"?><manifest identifier="man00001" xmlns:bb="http://www.blackboard.com/content-packaging/"><organizations/><resources><resource bb:file="res00001.dat" bb:title="' + poolTitle + '" identifier="res00001" type="assessment/x-bb-qti-pool" xml:base="res00001"/><resource bb:file="res00002.dat" bb:title="Assessment Creation Settings" identifier="res00002" type="course/x-bb-courseassessmentcreationsettings" xml:base="res00002"/><resource bb:file="res00003.dat" bb:title="LearnRubrics" identifier="res00003" type="course/x-bb-rubrics" xml:base="res00003"/><resource bb:file="res00004.dat" bb:title="CSResourceLinks" identifier="res00004" type="course/x-bb-csresourcelinks" xml:base="res00004"/><resource bb:file="res00005.dat" bb:title="CourseRubricAssociation" identifier="res00005" type="course/x-bb-crsrubricassocation" xml:base="res00005"/><resource bb:file="res00006.dat" bb:title="Maths_Test_Platform" identifier="res00006" type="resource/x-mhhe-course-cx" xml:base="res00006"/></resources></manifest>');
    //var img = zip.folder("images");
    //img.file("smile.gif", imgData, {base64: true});

    //console.log(returnMainDat());

    /*zip.file(".bb-package-info", `#Bb PackageInfo Property File
    #Thu Sep 19 15:54:32 BST 2019
    java.class.path=C\:/blackboard/apps/service-wrapper/lib/wrapper.jar;C\:/Java/jdk1.8.0_191/lib/tools.jar;C\:/blackboard/apps/tomcat/lib/bb-tomcat-bootstrap.jar;C\:/blackboard/apps/tomcat/bin/bootstrap.jar;C\:/blackboard/apps/tomcat/bin/tomcat-juli.jar
    cx.config.course.id=Maths_Test_Platform
    java.vendor=Oracle Corporation
    cx.config.learn.installation.id=b67babf3977444e582a19aaed4b77004
    os.name=Windows Server 2012 R2
    os.arch=amd64
    java.home=C\:\\Java\\jdk1.8.0_191\\jre
    db.product.name=Microsoft SQL Server
    cx.package.info.version=6.0
    os.version=6.3
    cx.config.full.value=CxConfig{operation\=EXPORT, courseid\=Maths_Test_Platform, package\=C\:\\blackboard\\apps\\tomcat\\temp\\plugins\\bb-assessment\\1c5177da-efc1-4a73-a051-be495eb4f75b\\Pool_ExportFile_Maths_Test_Platform_`+ poolTitle + `.zip, logger\=CxLogger{logs\=[Log{name\=C\:\\blackboard\\apps\\tomcat\\temp\\plugins\\bb-assessment\\1c5177da-efc1-4a73-a051-be495eb4f75b\\Pool_ExportFile_Maths_Test_Platform_`+ poolTitle +`.log, verbosity\=default}, Log{name\=STDOUT, verbosity\=default}], logHooks\=[]}, resource_type_inclusions\=[], area_inclusions\=[ALIGNMENTS, RUBRIC], area_exclusions\=[ALL], object_inclusions\={POOL\=[_349347_1]}, object_exclusions\={}, features\={ArchiveUserPasswords\=false, CreateOrg\=false, AlternateAssessmentCsLinks\=false, ImportCourseStructure\=false, Bb5LinkToBrokenImageFix\=true}, strHostName\=null, isCommandLineRequest\=false, isCourseConversion\=false, eventHandlers\=[], primaryNode\=null, nodes\=[], title\=null, packageVersion\=null, archiveCSItems\=true, archiveECSItems\=false, archiveOnlyReferencedPpg\=true, commonCartridge\=false, createChildFolder\=false, csDir\=, excludedCsFolderIds\=null, homeDir\=, includeGradeHistoryInArchive\=false, isExportPackage\=false, logDetailRubricInfo\=false, taskId\=null, useDefaultLog\=true}
    cx.config.package.name=C\:\\blackboard\\apps\\tomcat\\temp\\plugins\\bb-assessment\\1c5177da-efc1-4a73-a051-be495eb4f75b\\Pool_ExportFile_Maths_Test_Platform_Pool to see structure of exported.zip
    db.product.version=12.0.5659
    db.driver.name=i-net MERLIA
    cx.config.operation=blackboard.apps.cx.CxConfig$Operation\:EXPORT
    java.version=1.8.0_191
    db.driver.version=8.04.03
    cx.config.package.identifier=95e89340fff544be9adf4b5bf41e6833
    java.default.locale=en_US
    app.release.number=3300.0.6-rel.49+ecc5c16
    cx.config.logs=[Log{name\=C\:\\blackboard\\apps\\tomcat\\temp\\plugins\\bb-assessment\\1c5177da-efc1-4a73-a051-be495eb4f75b\\Pool_ExportFile_Maths_Test_Platform_Pool to see structure of exported.log, verbosity\=default}, Log{name\=STDOUT, verbosity\=default}]
    cx.config.file.references=false`);
    //Hash name of pool title and use as signature
    zip.file(".bb-package-sig", hex_md5(poolTitle));
    zip.file(".bb-log-info", "");*/

    zip.file("res00001.dat", returnMainDat());

    zip.file("res00002.dat", '<?xml version="1.0" encoding="UTF-8"?>\n<ASSESSMENTCREATIONSETTINGS><ASSESSMENTCREATIONSETTING id="_51056_1"><QTIASSESSMENTID value="_346625_1"/><ANSWERFEEDBACKENABLED>false</ANSWERFEEDBACKENABLED><QUESTIONATTACHMENTSENABLED>false</QUESTIONATTACHMENTSENABLED><ANSWERATTACHMENTSENABLED>false</ANSWERATTACHMENTSENABLED><QUESTIONMETADATAENABLED>true</QUESTIONMETADATAENABLED><DEFAULTPOINTVALUEENABLED>false</DEFAULTPOINTVALUEENABLED><DEFAULTPOINTVALUE>-1.0</DEFAULTPOINTVALUE><ANSWERPARTIALCREDITENABLED>true</ANSWERPARTIALCREDITENABLED><ANSWERNEGATIVEPOINTSENABLED>true</ANSWERNEGATIVEPOINTSENABLED><ANSWERRANDOMORDERENABLED>true</ANSWERRANDOMORDERENABLED><ANSWERORIENTATIONENABLED>true</ANSWERORIENTATIONENABLED><ANSWERNUMBEROPTIONSENABLED>true</ANSWERNUMBEROPTIONSENABLED><USEPOINTSFROMSOURCEBYDEFAULT>true</USEPOINTSFROMSOURCEBYDEFAULT></ASSESSMENTCREATIONSETTING></ASSESSMENTCREATIONSETTINGS>');

    zip.file("res00003.dat", '<?xml version="1.0" encoding="UTF-8"?>\n<LEARNRUBRICS/>');

    zip.file("res00004.dat", '<?xml version="1.0" encoding="UTF-8"?>\n<cms_resource_link_list><cms_resource_link><courseId data-type="blackboard.data.course.Course">_125125_1</courseId>\n<parentId parent_data_type="asiobject">_346628_1</parentId><resourceId><![CDATA[4336865_2]]></resourceId><storageType><![CDATA[PUBLIC]]></storageType><id data-type="blackboard.platform.contentsystem.data.CSResourceLink">_1473122_1</id></cms_resource_link></cms_resource_link_list>');

    zip.file("res00005.dat", '<?xml version="1.0" encoding="UTF-8"?>\n<COURSERUBRICASSOCIATIONS/>');

    zip.file("res00006.dat", '<?xml version="1.0" encoding="UTF-8"?>\n<parentContextInfo><parentContextId>Maths_Test_Platform</parentContextId></parentContextInfo>');

    zip.generateAsync({type:"blob"})
    .then(function(content) {
        // see FileSaver.js
        saveAs(content, "BBPool.zip");
    });
}
function downloadQuestions() {
    var content = generateTextFile();
    if(!content) {
        alert("Some fields are not filled. Please check fields.");
    }
    console.log(content);
    if(content) {
        startDownload("filename", content);
    }
}
