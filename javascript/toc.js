/***** MY GRAND JAVASCRIPT FILE */

// probably this should be moved over to jQuery?
// something still going wrong with titlepages; this messes up arrow keys 

/***** OTHER PEOPLE'S THINGS/GENERAL */

function getByClass (className, parent) {
// from http://stackoverflow.com/questions/3808808/how-to-get-element-by-class-in-javascript 
  parent || (parent=document);
  var descendants=parent.getElementsByTagName('*'), i=-1, e, result=[];
  while (e=descendants[++i]) {
    ((' '+(e['class']||e.className)+' ').indexOf(' '+className+' ') > -1) && result.push(e);
  }
  return result;
}

function next(elem) {
// from http://stackoverflow.com/questions/868407/hide-an-elements-next-sibling-with-javascript 
    do {
        elem = elem.nextSibling;
    } while (elem && elem.nodeType !== 1);
    return elem;        
}

function previous(elem) {
    do {
        elem = elem.previousSibling;
    } while (elem && elem.nodeType !== 1);
    return elem;        
}

function textcleaner(text) {

// would be nice if this also cleaned out <em>s !

		var dummy = text.replace(/<br\s*[\/]?>/gi," ");
		return dummy;
}


/***** GLOBAL VARIABLES */

var indexednodes = new Array("header", "section", "chapter", "poem", "acknowledgements", "dedication","act","scene");
var indexedparentnodes = new Array("section","act");
var toccednodes = new Array("section", "chapter","poem","act","scene");
var toccednodesheaders = new Array("sectionhead","chapterhead", "poemtitle","actheader","sceneheader");
var toccednodessubheaders = new Array("sectionsubhead", "chaptersubhead", "poemsubtitle");

var nodeslist = new Array();
var toclist = new Array();
var toctextlist = new Array();
var currentnode = "";
var titletext = "";
var sectioned = true;

var leftarrow = document.createElement('a');
var rightarrow = document.createElement('a');


/***** TYPOGRAPHY *******/


function typography() {

// first, fix dropped lines; this only works for "speechlines", how can we separate out classes?

	var droppedlines = getByClass("droppedline", document);
	for(i in droppedlines) {
		var thisdroppedline = droppedlines[i];
		var lineclass = "";
		var thisclass = thisdroppedline.className.split(" ");
		for (j in thisclass) {
			if(thisclass[j] != "droppedline") {
				if(lineclass) {
					lineclass += " " + thisclass[j];
				}
				lineclass = thisclass[j];
			}
		}

		var scenenode = thisdroppedline;

		while(!indexednodes.indexOf(scenenode.className)) {
			scenenode = scenenode.parentNode;
		}
		var speechlines = getByClass(lineclass,document);
		var droppedposition = speechlines.indexOf(thisdroppedline);
		var previousline = speechlines[droppedposition-1];
		thisdroppedline.innerHTML = '<span style="visibility:hidden;margin-right:0.5em;">' + previousline.innerHTML + "</span>" + thisdroppedline.innerHTML;
	}

// line numbering?
// problem: need to reset for each scene
	
	for(k in nodeslist) {
		var currentsection = document.getElementById(nodeslist[k]);

// if node is not a parent node (act, section), we can index

		if(indexedparentnodes.indexOf(currentsection.className) === -1) {

			var speechlines = getByClass("speechline",currentsection);
			var j = 0;
			for(i in speechlines) {
				j++;
				if(!(j%5)) {

			  var lninsert = document.createElement("span");
				lninsert.setAttribute("class","linenumber");
				lninsert.innerHTML = j;
				speechlines[i].appendChild(lninsert);
				}
			}
		}
	}
}


/***** INDEX/SHOW/HIDE FOOTNOTES */

function indexfootnotes() {
	var footnotes = getByClass("floatnote", document);
	for(i in footnotes) {
		var thisfootnote = footnotes[i];
		thisfootnote.style.visibility = "hidden";

		var callout = previous(thisfootnote);
		var calloutparent = callout.parentNode;
		var calloutlink = document.createElement('a');
		calloutparent.replaceChild(calloutlink,callout);
		calloutlink.appendChild(callout);
		calloutlink.setAttribute('id',"callout"+i);
		callouthref = 'javascript:showfootnote('+i+');';
		calloutlink.setAttribute('href',callouthref);

		var footnoteparent = thisfootnote.parentNode;
		var footnotelink = document.createElement('a');
		footnoteparent.replaceChild(footnotelink,thisfootnote);
		footnotelink.appendChild(thisfootnote);
		footnotelink.setAttribute('id',"footnote"+i);
		footnotehref= 'javascript:hidefootnote('+i+');';
		footnotelink.setAttribute('href',footnotehref);
		footnotelink.setAttribute('class',"footnotelink");
	}
}

function showfootnote(reference) {
	var footnoteid = 'callout'+reference;
	var footnotecallout = document.getElementById(footnoteid);
	var footnotenext = footnotecallout.nextSibling.firstChild;
	if(footnotenext.style.visibility == 'visible') {
		footnotenext.style.visibility = 'hidden';
	}	else {
		footnotenext.style.visibility = 'visible';
	}
}

function hidefootnote(reference) {
	var footnoteid = 'footnote'+reference;
	var footnotewrapper = document.getElementById(footnoteid);
	footnotewrapper.firstChild.style.visibility = 'hidden';
}

/***** NAVIGATION */

// this would probably be much simpler in jquery
// from http://www.webdeveloper.com/forum/showthread.php?97938-function-to-jump-to-anchor-on-key-press

// first: go through & index all the nodes (sections, chapters, poems, poemsections)
// second: figure out where the reader is
// third: register left or right arrow presses & go to previous or next node

function loopnodes(startingelement, nodecount, idprefix) {
	var allchildren = startingelement.childNodes;
	for(i in allchildren) {
		currentclass = allchildren[i].className;
		if(currentclass) {
			for(j in indexednodes) {
				if(currentclass == indexednodes[j]) {
					// make an id for the element

					generatedid = idprefix + allchildren[i].className + nodecount + "-gen";
					allchildren[i].setAttribute("id",generatedid);
					nodeslist[nodecount] = allchildren[i].id;
					nodecount ++;

					// if toc node, add it to the list

					for(k in toccednodes) {
						if(currentclass==toccednodes[k]) {
							currentheader = getByClass(toccednodesheaders[k],allchildren[i])[0];
							if(currentheader) {
								toclist.push(allchildren[i].id);
								var output = textcleaner(currentheader.innerHTML);
								// check if there's a subheader
								currentsubheader = getByClass(toccednodessubheaders[k],allchildren[i])[0];
								if(currentsubheader) {
									if(currentsubheader.innerHTML.substring(0,1)=='(') {
										output = output + " " + textcleaner(currentsubheader.innerHTML);
									} else {
										output = output + ": " + textcleaner(currentsubheader.innerHTML);
									}
								}
								toctextlist.push(output);
							}
						}
					}
					for(k in indexedparentnodes) {
						if(currentclass ==indexedparentnodes[k]) {
							nodecount = loopnodes(allchildren[i],nodecount,"indent-");
						}
					}
				}
			}
		}
	}
	return nodecount;
}


function indexnodes() {
	//loop through "centercolumn", get all "header", "chapter", "section", "poem"
	var centercolumn = getByClass("centercolumn",document)[0];
	loopnodes(centercolumn, 0, "");
	currentnode = nodeslist[0];
}



function showall() {
	for(i in nodeslist) {
		var nodename = document.getElementById(nodeslist[i]);
		nodename.style.display = 'block'
	}
	document.getElementById(currentnode).scrollIntoView();
	//
	// One problem: this doesn't show sectionheads, which we should probably treat differently. How?
	//
	sections = getByClass("sectionhead",document);
	if(sections) {
		for(j in sections) {
			sections[j].style.display = 'block';
		}
	}
}


function setsection(nodeid) {

// turn off everything

	currentnode = nodeid;
	location.hash = nodeid;
	for(i in nodeslist) {
		var nodename = document.getElementById(nodeslist[i]);
		nodename.style.display = 'none';
	}

// hide arrows, if they exist	
	document.getElementById("leftarrow").style.visibility = "hidden";
	document.getElementById("rightarrow").style.visibility = "hidden";

// turn off sectionheads

  sections = getByClass("sectionhead",document);
  if(sections) {
		for(j in sections) {
			sections[j].style.display = 'none';
		} 	
  }
  // are we indented? If so, turn on parent.

  if(nodeid.substring(0,7) == "indent-") {
  	var k = nodeslist.indexOf(nodeid);
  	while(nodeslist[k].substring(0,7) == "indent-") {
  		k--;
  	}
  	var parentsection = document.getElementById(nodeslist[k]);
  	parentsection.style.display = 'block';
  }

	// are we a section? if so, turn on sectionhead.
	if(nodeid.substring(0,7) == "section") {
		var currentsection = document.getElementById(nodeid);
		currentsection.style.display = 'block';
		var sectionhead = getByClass('sectionhead',currentsection)[0];
		sectionhead.style.display = 'block';
	}

	// turn on current section

	nodename = document.getElementById(nodeid);
	nodename.style.display = 'block'
	document.getElementById(currentnode).scrollIntoView();

	// show arrows, if necessary

	var nodeposition = nodeslist.indexOf(currentnode);
	if(nodeslist[nodeslist.indexOf(nodeid)-1]) {
		// set previous button
		var workingarrow = document.getElementById("leftarrow");
		workingarrow.style.visibility = "visible";
	   	workingarrow.setAttribute('href','javascript:setsection("'+nodeslist[nodeposition-1]+'");');
	}
	if(nodeslist[nodeslist.indexOf(nodeid)+1]) {
		// set next button
		var workingarrow = document.getElementById("rightarrow");
		workingarrow.style.visibility = "visible";
	   	workingarrow.setAttribute('href','javascript:setsection("'+nodeslist[nodeposition+1]+'");');
	}

	// set title if chapter

	if(nodename.className === "chapter") {
		if(getByClass("chapterhead",nodename)[0]) {
			if(getByClass("chaptersubhead",nodename)[0]) {
				document.title = titletext + " | " + textcleaner(getByClass("chapterhead",nodename)[0].innerHTML) + ": " + textcleaner(getByClass("chaptersubhead",nodename)[0].innerHTML);
			} else {
				document.title = titletext + " | " + textcleaner(getByClass("chapterhead",nodename)[0].innerHTML);
			}
		}
	} else {
		if(nodename.className === "poem") {
			if(getByClass("poemtitle",nodename)[0]) {
				if(getByClass("poemsubtitle",nodename)[0]) {
					document.title = titletext + " | " + textcleaner(getByClass("poemtitle",nodename)[0].innerHTML) + ": " + textcleaner(getByClass("poemsubtitle",nodename)[0].innerHTML);
				} else {
					document.title = titletext + " | " + textcleaner(getByClass("poemtitle",nodename)[0].innerHTML);
				}
			}

		} else {
			if(nodename.className === "act") {
				if(getByClass("actheader",nodename)[0]) {
					document.title = titletext + " | " + textcleaner(getByClass("actheader",nodename)[0].innerHTML);
				}
			} else {
				if(nodename.className === "scene") {
					if(getByClass("sceneheader",nodename)[0]) {
						document.title = titletext + " | " + textcleaner(getByClass("actheader",nodename.parentNode)[0].innerHTML) + ", " + textcleaner(getByClass("sceneheader",nodename)[0].innerHTML);
					}
				} else {
					console.log(nodename.className);
					document.title = titletext;
				}
			}
		}			
	}
}


function decipher() {
		if (event.type == "keydown") {
		   if (event.charCode) {
		      var charCode = event.charCode;
		   }
		   else {
		      var charCode = event.keyCode;
		   }
		}
		var nodeposition = nodeslist.indexOf(currentnode);
	  switch (charCode) {
	    case 37: // left arrow
	    	if(nodeposition > 0) {
	    		nodeposition--;
	   			currentnode = nodeslist[nodeposition]; 		
	    		setsection(currentnode);
	    	}
	    	break;
	    case 39: // right arrow
	    	if((nodeposition+1) < nodeslist.length) {
	    		nodeposition++;
	   			currentnode = nodeslist[nodeposition]; 		
	    		setsection(currentnode);
	    	}
	    	break;
	    case 40: // down arrow
	    case 34: // pagedown
	    	if((window.innerHeight + document.body.scrollTop) === document.body.offsetHeight) {
		    	if((nodeposition+1) < nodeslist.length) {
		    		nodeposition++;
		   			currentnode = nodeslist[nodeposition]; 		
		    		setsection(currentnode);
		        event.stopPropagation();
        		event.preventDefault();
		    	}
	    		break;
	    	} else {
	    		break;
	    	}
	    case 38: //up arrow
	    case 33: //pageup
	    	if(document.body.scrollTop === 0) {
	    		if(nodeposition > 0) {
	    			nodeposition--;
	   				currentnode = nodeslist[nodeposition]; 		
	    			setsection(currentnode);
	    			document.body.scrollTop = document.body.scrollHeight;
		        event.stopPropagation();
        		event.preventDefault();
	    		}
	    	}
	    	break;
	  }
	};


/***** TABLES OF CONTENTS */

// flip toc on and off 

function createtoc() {
	var tocsection = getByClass("toc",document)[0];
	var existingtoc = document.getElementById("insertedtoc");
	if(existingtoc) {
    // toc exists, remove it
    tocsection.removeChild(existingtoc);
  } else {

    // create toc section

    var everything = "";
    for(i in toclist) {
	    if((toclist[i].substring(0,7)) == "indent-") {
	    	if(toctextlist[i].length < 3) {
		    	liclass = ' class="inline"';
	    	} else {
	    		liclass = ' class="indented"'
	    	}
	    } else {
	    	liclass = ' class="regular"';
	    }
	    console.log(toclist[i]);
	    if(toclist[i] === currentnode) {
	    	liclass = liclass + ' id="currentsection"';
	    }
	    var output = '<li' +liclass + '><a href="#'+toclist[i]+'" onClick="javascript:setsection(\''+toclist[i]+'\');">' + toctextlist[i] + "</a></li>\n";
	    everything = everything + output;
    }

    // insert the ol element with the text

    everything = everything + '<li id="tocbottom">Show all</li>';

	  var tocinsert = document.createElement("ol");
		tocinsert.setAttribute("id","insertedtoc");
		tocinsert.innerHTML = everything;

		tocsection.appendChild(tocinsert);
		document.getElementById("tocbottom").setAttribute("onclick", "showall()");

  }
}


function initializetoc() {
	
	// hide toc if toclist < 2	

	var tocsection = getByClass("toc",document)[0];
	if(toclist.length > 1) {
		tocsection.style.display = "block";

		// Create toc link – this vacuums out tocheader's content
		// Maybe have this insert all of TOC section? Could be useful later.
		tocsection.setAttribute("onclick", "createtoc()");
		// show the toc be a hover?
		var tocheader = tocsection.firstChild;
		tocheader.innerHTML = "Contents";
	} else {
		tocsection.style.display = "none";
		sectioned = false;
	}
}

function initializekeys() {
	document.body.addEventListener("keydown", function(event) {
		decipher();
			},false);
}

function initializenav() {
	var mainsection = getByClass("main",document)[0];
	var navheader = document.createElement('nav');
	mainsection.appendChild(navheader);
	navheader.innerHTML = "";
	navheader.setAttribute('class','arrows');
	leftarrow.setAttribute('id','leftarrow');
	navheader.appendChild(leftarrow);
	leftarrow.innerHTML = "«";

	rightarrow.setAttribute('id','rightarrow');
	navheader.appendChild(rightarrow);
	rightarrow.innerHTML = "»";

}

function initializetitle() {
	var title = getByClass("title",document)[0];
	if(title) {
		titletext = "“" + textcleaner(title.innerHTML) + "”";
	}
	var author = getByClass("author",document)[0];
	if(author) {
		titletext = textcleaner(author.innerHTML) + ", " + titletext;
	}
	document.title = titletext;
}

function checkurl() {
	if(window.location.href.indexOf("#") > -1) {
		currentnode = window.location.href.substring(window.location.href.indexOf("#")+1,window.location.href.length);
	}
}


/***** INITIALIZE */

window.onload = function startup() {

	// create ids for all structural elements: arrays are nodeslist and toclist

	indexnodes();

	// maybe check for a passed node in the URL?

	checkurl();

	// process dropped lines

	typography();

	// process footnotes: create anchors + ids, hide them.

	indexfootnotes();

	// initialize the table of contents

	initializetoc();

	// set page title

	initializetitle();


	if(sectioned) {

	// initialize the navigation

		initializenav();

	// turn on the key listener

		initializekeys();

	// only show the first section.

		setsection(currentnode);
	}

};
