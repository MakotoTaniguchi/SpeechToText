"use strict";
var webkitSpeechRecognition = window.webkitSpeechRecognition;
$(function () {
    window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.maxAlternatives = 5;
    recognition.onresult = function (event) {
        var confidence = event.results[0][0].confidence;
        var transcript = event.results[0][0].transcript;
        for (var index_1 = 1; index_1 < event.results[0].length; index_1++) {
            var speechRecognitionAlternative = event.results[0].item(index_1);
            if (confidence < speechRecognitionAlternative.confidence) {
                confidence = speechRecognitionAlternative.confidence;
                transcript = speechRecognitionAlternative.transcript;
            }
        }
        var userName = $('#user_name').val();
        var lines = $('#text_lines').val();
        var inputLine = userName + '：' + transcript + '\n';
        if (userName == "") {
            return;
        }
        $.ajax({
            type: "POST",
            url: "Speech/Send",
            data: { send_text: inputLine },
            error: function () {
                alert('通信エラー');
            }
        });
    };
    recognition.onend = function () {
        if ($('#rec_type').data('type') == 'start') {
            return;
        }
        $('#rec_type').data('type', 'abort');
        $('#rec_type').text("録音中断");
        recognition.start();
    };
    var intervalNumber = 0;
    $('#rec_type').on("click", function () {
        if ($('#rec_type').data('type') == "start") {
            if ($('#user_name').val() == '') {
                alert('名前が未入力');
                return;
            }
            $('#rec_type').data('type', 'abort');
            $('#rec_type').text("録音中断");
            recognition.start();
            intervalNumber = setInterval(function () {
                getHistory(index);
            }, 1000);
        }
        else {
            $('#rec_type').data('type', 'start');
            $('#rec_type').text("録音開始");
            recognition.abort();
            clearInterval(intervalNumber);
        }
    });
    navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
        var inputDevices = devices.filter(function (device) {
            return device instanceof InputDeviceInfo;
        });
        var $inputDevice = $("#input_devices");
        inputDevices.forEach(function (device, index) {
            var option = '<option value="' + device.deviceId + '">' + device.label + '</option>';
            $inputDevice.append(option);
        });
    });
    $("#input_devices").on("change", function () {
        var optionValue = $('#input_devices > option:selected').val();
        navigator.mediaDevices.getUserMedia({
            audio: { deviceId: optionValue },
            video: false
        });
    });
    var index = 0;
    function getHistory(countIndex) {
        $.ajax({
            type: "GET",
            url: "Speech/History",
            data: { index: countIndex },
            success: function (data, dataType) {
                var jsonData = data;
                if (jsonData.index == 0) {
                    return;
                }
                if (jsonData.index > index) {
                    jsonData.index = index;
                }
                var line = "";
                jsonData.lines.forEach(function (text) {
                    line = line + text + '\n';
                });
                $('#text_lines').val(line);
            },
            error: function () {
                alert('通信エラー');
            }
        });
    }
});
var SpeechJson = (function () {
    function SpeechJson() {
        this.index = 0;
        this.lines = new Array();
    }
    return SpeechJson;
}());
