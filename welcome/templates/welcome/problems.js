window.localStorage.setItem('index', (window.parseInt(window.localStorage.getItem('index')) || 0).toString());

window.object = {
    problems: [],
    index: 0,
    current: 'description'
};

(function ($, document, eval, localStorage, object, parseInt) {
    $('#previous-problem').bind('click', clickPreviousProblem);
    $('#next-problem').bind('click', clickNextProblem);
    $('.nav-link.description').bind('click', clickDescription);
    $('.nav-link.hints').bind('click', clickHints);
    $('#submit').bind('click', validate);

    $.ajax({
        url: 'http://django-psql-persistent-django-psql-persistent.193b.starter-ca-central-1.openshiftapps.com/problems'
    }).done(function (problems) {
        let index = parseInt(localStorage.getItem('index'));
        object.index = index < problems.length ? index : problems.length - 1;
        object.problems = problems || [];
        render();
    }).fail(function () {
        $('#app').html('No Problem Available!');
    });

    function clickPreviousProblem() {
        object.index -= object.index > 0 ? 1 : 0;
        render();
    }

    function clickNextProblem() {
        object.index += object.index < object.problems.length - 1 ? 1 : 0;
        render();
    }

    function clickDescription() {
        object.current = 'description';
        $('.nav-link.description').addClass('active');
        $('.nav-link.hints').removeClass('active');
        render();
    }

    function clickHints() {
        object['current'] = 'hints';
        $('.nav-link.description').removeClass('active');
        $('.nav-link.hints').addClass('active');
        render();
    }

    function validate() {
        let message = $('#message');
        setTimeout(function () {
            message.html('');
            message.css('color', '');
        }, 1000);
        for (let index = 0; index < object.problems[object.index]['answers'].length; ++index) {
            let text = $('#editor input')[index].value;
            if (text !== object.problems[object.index]['answers'][index]) {
                message.html('Wrong Answer');
                message.css('color', 'red');
                return;
            } else {
                message.html('Accepted');
                message.css('color', 'green');
            }
        }
        localStorage.setItem('index', (object.index + 1).toString());
        object.index += object.index < object.problems.length - 1 ? 1 : 0;
        object.current = 'description';
        render();
    }

    function render() {
        let problem = object.problems[object.index];
        $('#title span').html('问题' + (object.index + 1) + '/' + object.problems.length);
        let content = problem[object.current];
        if (object.index < localStorage.getItem('index')) {
            $('#next-problem').attr('disabled', false);
            $('#content').html(calculate(problem['answers']));
            $('#input').hide();
        } else {
            $('#next-problem').attr('disabled', true);
            let answers = [];
            for (let index = 0; index < problem['answers'].length; ++index) {
                let span = document.createElement('span');
                span.innerHTML = '(?)';
                span.style.color = getRandomColor();
                answers.push(span.outerHTML);
            }
            $('#content').html(calculate(answers));
            let editor = $('#editor');
            editor.empty();
            let label = document.getElementById('editor-template').content.querySelector('label');
            let input = document.getElementById('editor-template').content.querySelector('input');
            for (let i = 0; i < problem['answers'].length; ++i) {
                label.setAttribute('for', 'p' + i);
                label.innerHTML = '第' + (i + 1) + '个' + answers[i] + '：';
                input.setAttribute('id', 'p' + i);
                editor.append(label.outerHTML);
                editor.append(input.outerHTML);
            }
        }

        function calculate(answers) {
            if (answers) {
                return eval('`' + content + '`');
            }
        }
    }
})(window.$, window.document, window.eval, window.localStorage, window.object, window.parseInt);

function getRandomColor() {
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += Math.floor(Math.random() * 16).toString(16);
    }
    return color;
}
