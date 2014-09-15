var rows = 0;

Dropzone.options.dropzoneForm = {
  maxFilesize: 100 * 1024,
  init: onInit
};

function onInit() {
  this.on('success', onSuccess);
}

function onSuccess(file, response) {
  var url = location.protocol + '//' + location.host + '/' + response;
  var result = $('#result');

  if (rows == 0)
    result.val(url);
  else
    result.val(result.val() + '\n' + url);

  rows += 1;
  result.attr('rows', rows);
  result.show();
  result.select();
}
