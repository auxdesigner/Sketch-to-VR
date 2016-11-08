// code structured borrowed from https://github.com/Raureif/sketch-click-dummy
// import sandbox for authorization
@import 'sandbox.js'

// In the new folder structure, the plugin won't work without this line. I don't know why the previous version didn't need this. 
var doc = NSDocumentController.sharedDocumentController().currentDocument();

// open the system dialog to choose the export location
var fileURL = fileSaver();

// HTML will be exported to a new folder in the .sketch file's parent folder
var exportPath = fileURL.path() + '/' + [doc displayName] + '-VR/';

//var imgList = [];
//var artboardNames = [];
//convert artboard images to DOM elements
var artboards = doc.currentPage().artboards().objectEnumerator();
while (artboard = artboards.nextObject()) {
  //get artboard names
  var artboardName = artboard.name().trim();

  //add ui as curved image
  if (artboardName = 'ui') {
    ui = '<a-curvedimage src="img/' + artboardName + '.png" radius="4" theta-length="360" height="12" scale=".3 .3 .3"></a-curvedimage>\n'
  }

  //add background as sky
  if (artboardName = 'background') {
    background = '<a-sky src="img/' + artboardName + '.png"><a-root><a-entity geometry="primitive: sphere" material="shader: flat; src: url(img/background.png);" scale="1 1 1"></a-entity></a-root></a-sky>\n'
  }
}

//TODO: support multi artboards
// for(var i=0, len=artboardNames.length; i < len; i++){
//   imgList.push('<a-curvedimage src="img/' + artboardNames[i] + '.png" radius="4" theta-length="360" height="11" scale=".5 .5 .5"></a-curvedimage>\n');
//   //TODO: in multi image case, remove comma from array;
// }

// authorize Sketch to save a file
new AppSandbox().authorize(exportPath, exportVR);

// export mocks and create HTML file
function exportVR () {
  createFolder(exportPath);

  var html = '';

  //beginning of the page
  var HTML_HEAD = '<!DOCTYPE html>\n\
<html lang="en">\n\
<head>\n\
<meta charset="utf-8">\n\
<title>' + [doc displayName] + '</title>\n\
<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\
<script src="https://aframe.io/releases/0.2.0/aframe.min.js"></script> \n\
</head>\n\
<body>\n\
<a-scene>\n';

  //end of the page
  var HTML_FOOT = 
'<a-entity camera look-controls>\n\
<a-entity cursor="fuse: true;" position="0 0 -1" scale=".01 .01 .01" geometry="primitive: ring" material="color: #fff; shader: flat">\n\
</a-entity>\n\
</a-entity>\n\
</a-scene>\n\
</body>\n\
</html>\n';

  //add page beginning, curved image, sky and page end 
  html = HTML_HEAD + ui + background + HTML_FOOT;   
  createPage(html);

  //export artboard as images
  var slices = doc.currentPage().artboards().objectEnumerator();
  while (slice = slices.nextObject()) {
    var slice2x = copy_layer_with_factor(slice, 2);
    [doc saveArtboardOrSlice:slice2x toFile:exportPath + 'img/' + slice.name() + '.png'];
  }

  doc.showMessage('Files exported to: ' + exportPath);
}

function createPage(html) {
  var htmlPath = exportPath + 'index' + '.html';
  saveTextToFile(htmlPath, html);
}

function createFolder(name) {
  var fileManager = [NSFileManager defaultManager];
  [fileManager createDirectoryAtPath:name withIntermediateDirectories:true attributes:nil error:nil];
}

function saveTextToFile (filename, text) {
  var path = [@"" stringByAppendingString:filename];
  var str = [@"" stringByAppendingString:text];
  str.dataUsingEncoding_(NSUTF8StringEncoding).writeToFile_atomically_(path, true);
}

function fileSaver() {
    var openPanel = [NSOpenPanel openPanel]
    [openPanel setTitle: "Choose a location…"]
    [openPanel setMessage: "Select the export location…"];
    [openPanel setPrompt: "Export"];
    [openPanel setCanCreateDirectories: true]
    [openPanel setCanChooseFiles: false]
    [openPanel setCanChooseDirectories: true]
    [openPanel setAllowsMultipleSelection: false]
    [openPanel setShowsHiddenFiles: false]
    [openPanel setExtensionHidden: false]
    var openPanelButtonPressed = [openPanel runModal]
    if (openPanelButtonPressed == NSFileHandlingPanelOKButton) {
        allowedUrl = [openPanel URL]
    }
    return allowedUrl
}

// Resize the layer based on factor, borrowed from https://github.com/Raureif/sketch-click-dummy/pull/11
function copy_layer_with_factor(original_slice, factor){
    var copySlice = [original_slice duplicate];
    var frame = [copySlice frame];
    var rect = [copySlice absoluteInfluenceRect],
    // slice = [MSExportRequest requestWithRect:rect scale:factor];
    slice = MSExportRequest.new();
    slice.rect = rect;
    slice.scale = factor;
    [copySlice removeFromParent];
    //log("Slicing " + slice);
    return slice;
}