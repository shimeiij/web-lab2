$(document).ready(function () {
    let canvas = $('#canvas');

    const COEFF = 67;
    const AXIS = 110;

    const Y_MIN = -3;
    const Y_MAX = 3;
    const X_VALUES = ['-2', '-1.5', '-1', '-0.5', '0', '0.5', '1', '1.5', '2'];
    const error = document.querySelector('#x_value+span.error');

    let x;
    let radius;
    let isValid = false;
    let yField = document.getElementById("y_val");

    let value = $("#y_val").val().replace(',', '.');
    let array = Array.prototype.slice.call(document.getElementsByName("r_value"));

    function select(element) {
        element.onclick = function () {
            radius = $(this).val();
        }
    }

    function getRadius() {
        array.forEach(select);
    }

    function getX() {
        $('input[name="x_value"]').on('check', function () {
            x = $('input[name="x_value"]:checked').val();
            console.log("x-value: " + x);
        })
    }

    function validateX() {
        if ($('input[name="x_value"]').not(':checked')) {
            alert("where x");
            isValid = false;
        }
    }


    function isValidValue(node) {
        return node.validity.valid;
    }


    function validateY() {
        yField.addEventListener("input", function (event) {
            console.log("check y");
            if (isValidValue(yField)) {
                isValid = true;
                error.textContent = '';
                error.className = 'error';
            } else {
                showMessage();
                event.preventDefault();
            }
        });
    }

    function checkFirstQuarter(x, y, r) {
        return x <= 0 && y >= 0 && x * x + y * y <= r / 2;
    }

    function checkSecondQuarter(x, y, r) {
        return x >= 0 && y >= 0 && x <= r / 2 && y <= r;
    }

    function checkForthQuarter(x, y, r) {
        return x >= 0 && y <= 0 && y >= x - r / 2;
    }


    function checkCoordinates(x, y, r) {
        return checkFirstQuarter(x, y, r) || checkSecondQuarter(x, y, r) || checkForthQuarter(x, y, r);
    }


    function showMessage() {
        if (yField.validity.valueMissing || !(value instanceof Number)) {
            error.textContent = 'Пожалуйста, введите число! :(';
        } else if (!isNaN(parseFloat(value))) {
            error.textContent = 'Вы ввели невалидное число!';
        }

        if (yField.validity.rangeOverflow) {
            error.textContent = 'Максимальное значение y = 3!';
        }
        if (yField.validity.rangeUnderflow) {
            error.textContent = "Минимальное значение у = -3!"
        }
        error.className = 'error active';
    }

    function clearCanvas() {
        canvas[0].getContext('2d').clearRect(0, 0, canvas.width(), canvas.height());
    }

    function drawPoint(x, y, color) {
        clearCanvas();
        let Axes = canvas[0].getContext('2d');
        if (x > canvas.width() || x < -canvas.width() || y > canvas.height() || y < -canvas.height()) {
            return;
        }
        console.log("I start draw");
        Axes.setLineDash([2, 2]);
        Axes.beginPath();
        Axes.moveTo(x, 110);
        Axes.lineTo(x, y);
        Axes.moveTo(110, y);
        Axes.lineTo(x, y);
        Axes.stroke();
        Axes.fillStyle = color;
        Axes.arc(x, y, 2, 0, 2 * Math.PI);
        Axes.fill();
    }

    function redrawFromInput(x, y, radius) {
        let color = 'red';
        if (checkCoordinates(x, y, radius)) {
            color = 'green';
            console.log('checked');
        }
        drawPoint(x * COEFF / radius + AXIS, -(y / radius * COEFF - AXIS), color);
    }

    function clickDraw(event) {
        let x = (event.offsetX - AXIS) / COEFF * radius;
        let minDiff = Infinity;
        let nearestXValue;
        for (let i = 0; i < X_VALUES.length; i++) {
            if (Math.abs(x - X_VALUES[i]) < minDiff) {
                minDiff = Math.abs(x - X_VALUES[i]);
                nearestXValue = X_VALUES[i];
            }
        }

        let y = (-event.offsetY + AXIS) / COEFF * radius;
        if (y < Y_MIN) y = Y_MIN;
        if (y > Y_MAX) y = Y_MAX;

        let color = 'red';
        if (checkCoordinates(x, y, radius)) {
            color = 'green';
        }

        drawPoint(COEFF * nearestXValue / radius + AXIS, -(y / radius * COEFF - AXIS), color);
        let ySelected = $('input[name="y_value"][value="' + y.trim() + '"]');
        ySelected.trigger("click");
    }

    canvas.on('click', clickDraw);


    validateY();
    getRadius();
    getX();
    validateX();
    $("#form").on("submit", function (event) {
        event.preventDefault();
        console.log("submitted");

        if (!isValid) {
            return;
        }


        $.ajax({
            type: "POST",
            url: "script.php",
            data: $(this).serialize() + "&timezone=" + new Date().getTimezoneOffset(),
            beforeSend: function () {
                $(".send_form").attr("disabled", "disabled");
            },
            success: function (data) {
                console.log("ajax_success: " + data);
                $(".send_form").attr("disabled", false);
                let result_style = document.getElementById('row').style;
                result_style.display = 'table-row';
                document.getElementById('receiver').innerHTML = data;
            },
            error: function () {
                console.log("error");
                $(".send_form").attr("disabled", false);
            }
        })
        return true;
    });

    $('#form').on("reset", function (event) {
        $('.set_y').removeClass('y_selected');
    })


    $(".set_r").on("click", function () {
        let x = $('input[name="x_value"]:checked').val();
        let y = $('#y_val').val();
        getRadius();

        let svgGraph = document.querySelector(".result-graph").getSVGDocument();
        svgGraph.querySelector('.coordinate-text_minus-Rx').textContent = (-radius).toString();
        svgGraph.querySelector('.coordinate-text_minus-Ry').textContent = (-radius).toString();
        svgGraph.querySelector('.coordinate-text_minus-half-Rx').textContent = (-radius / 2).toString();
        svgGraph.querySelector('.coordinate-text_minus-half-Ry').textContent = (-radius / 2).toString();
        svgGraph.querySelector('.coordinate-text_plus-Rx').textContent = (radius).toString();
        svgGraph.querySelector('.coordinate-text_plus-Ry').textContent = (radius).toString();
        svgGraph.querySelector('.coordinate-text_plus-half-Rx').textContent = (radius / 2).toString();
        svgGraph.querySelector('.coordinate-text_plus-half-Ry').textContent = (radius / 2).toString();

        redrawFromInput(x, y, radius);
    });

    $('#y_val').on('change', function () {
        let y = $('#y_val').val();
        getRadius();
        redrawFromInput(x, y, radius);
    })

    $('.set_X').on('click', function () {
        let y = $('#y_val').val();
        redrawFromInput(x, y, radius);
    })


});