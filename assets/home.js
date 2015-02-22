Dropzone.options.dropzoneForm = {
  maxFilesize: 100 * 1024,
  init: onInit
};

function onInit() {
  this.on('success', onSuccess);
}

function onSuccess(file, response) {
  var url = location.protocol + '//' + location.host + '/' + response;
  var txtArea = $('#result');

  // count number of rows in txtArea
  var rows = txtArea.val().split("\n").length;

  txtArea.val(txtArea.val() + '\n' + url);

  rows += 1;
  txtArea.attr('rows', rows);
  txtArea.show();
  txtArea.select();
}
