const { webkitSpeechRecognition } = window as any;

$(() => {
  window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'ja-JP';
  recognition.maxAlternatives = 5;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let confidence: number = event.results[0][0].confidence;
    let transcript: string = event.results[0][0].transcript;
    for (let index: number = 1; index < event.results[0].length; index++) {
      let speechRecognitionAlternative: SpeechRecognitionAlternative = event.results[0].item(index);
      if (confidence < speechRecognitionAlternative.confidence) {
        confidence = speechRecognitionAlternative.confidence;
        transcript = speechRecognitionAlternative.transcript;
      }
    }

    let userName = $('#user_name').val();
    var now = new Date();
    let inputLine = now.toLocaleDateString() + " " + now.toLocaleTimeString() + " " + userName + '：' + transcript + '\n';

    if (userName == "") {
      return;
    }

    $.ajax({
      //POST通信
      type: "POST",
      //ここでデータの送信先URLを指定します。
      url: "Speech/Send",
      data: { send_text: inputLine },
      //処理が成功したら
      // success: function (data, dataType) {
      //   //HTMLファイル内の該当箇所にレスポンスデータを追加する場合
      //   $('#text_lines').val(lines + inputLine);
      // },
      //処理がエラーであれば
      error: function () {
        alert('通信エラー');
      }
    });
  }

  recognition.onend = () => {
    if ($('#rec_type').data('type') == 'start') {
      return;
    }

    $('#rec_type').data('type', 'abort');
    $('#rec_type').text("録音中断");
    recognition.start();
  };

  let intervalNumber: number = 0;
  $('#rec_type').on("click", () => {
    if ($('#rec_type').data('type') == "start") {
      if ($('#user_name').val() == '') {
        alert('名前が未入力');
        return;
      }

      $('#rec_type').data('type', 'abort');
      $('#rec_type').text("録音中断");

      intervalNumber = setInterval(() => {
        getHistory(index);
      }, 1000);

      recognition.start();
    }
    else {
      $('#rec_type').data('type', 'start');
      $('#rec_type').text("録音開始");
      recognition.abort();
      clearInterval(intervalNumber);
    }
  });

  let $inputDevice = $("#input_devices");
  if (navigator.mediaDevices != undefined) {
    navigator.mediaDevices.enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => { // 成功時
        var inputDevices = devices.filter((device: MediaDeviceInfo) => {
          return device instanceof InputDeviceInfo;
        });

        inputDevices.forEach((device: MediaDeviceInfo, index: number) => {

          if (device.label.match(/既定.*/) != null) {
            $inputDevice.text(device.label);
          }
        });
      }).catch((reason => {
        $inputDevice.text('なし');
      }));
  }
  else {
    $inputDevice.text('なし');
  }

  let index: number = 0
  function getHistory(countIndex: number) {
    $.ajax({
      //POST通信
      type: "GET",
      //ここでデータの送信先URLを指定します。
      url: "Speech/History",
      data: { index: countIndex },
      //処理が成功したら
      success: function (data, dataType) {
        //HTMLファイル内の該当箇所にレスポンスデータを追加する場合
        let jsonData = data as SpeechJson;
        if (jsonData.index == 0) {
          return;
        }

        if (jsonData.index > index) {
          jsonData.index = index;
        }

        let line = "";
        jsonData.lines.forEach((text) => {
          line = line + text + '\n';
        });
        $('#text_lines').val(line);
      },
      //処理がエラーであれば
      error: function () {
        alert('通信エラー');
      }
    });
  }
});

class SpeechJson {
  public index: number = 0;
  public lines: Array<string> = new Array<string>();
}