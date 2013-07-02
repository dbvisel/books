/* MY GRAND JAVASCRIPT FILE */

// Deal with Timoleon (kind of a mess!)



/* OTHER PEOPLE'S THINGS/GENERAL */

function getByClass (className, parent) {
/* from http://stackoverflow.com/questions/3808808/how-to-get-element-by-class-in-javascript */
  parent || (parent=document);
  var descendants=parent.getElementsByTagName('*'), i=-1, e, result=[];
  while (e=descendants[++i]) {
    ((' '+(e['class']||e.className)+' ').indexOf(' '+className+' ') > -1) && result.push(e);
  }
  return result;
}

function next(elem) {
/* from http://stackoverflow.com/questions/868407/hide-an-elements-next-sibling-with-javascript */
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
  	var dummy = text.replace(/<br\s*[\/]?>/gi," ");
		return dummy;
}

/* GLOBAL VARIABLES */

var numbersoff = false;  



/* SHOW/HIDE FOOTNOTES */

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



/* TABLES OF CONTENTS */


// Deal with scrollbars (Martin Eden)
// Deal with Timoleon (kind of a mess!)


function makelist(headerlist,subelement) {
	var output = "";
	for(i in headerlist) {
		var thischapterhead = headerlist[i];
		var thischapter = thischapterhead.parentNode;
		var thischaptertext = thischapterhead.innerHTML;
		var thischapterid = thischapter.id;
		output = output + '<li><a href="#'+thischapterid+'">' + thischaptertext + "</a></li>\n";
		if(subelement) {
			var subheaderlist = getByClass(subelement,thischapter);
	    if(subheaderlist[0]) {
	      	output = output + "\n<ol>" + makelist(subheaderlist) + "</ol>\n";
	    }
		}
	}
	output = textcleaner(output);
	return output;
}

function makelistsubtitles(headerlist,subheader) {

/* integrate this back into the other one? */

	var output = "";
	var thischaptertext = "";
	var subheaderlist = getByClass(subheader,document);

	for(i in headerlist) {
		thischapterhead = headerlist[i];
		thischaptertext = thischapterhead.innerHTML;

		// check if the chapter name starts with "chapter"; if so, ditch numbering
		if(thischaptertext.substring(0,7).toLowerCase()=="chapter") {
			numbersoff = true;
		} 

		thischapter = thischapterhead.parentNode;
		thischapterid = thischapter.id;

		if(subheaderlist[0]) {
			numbersoff = true;
			nextelement = next(thischapterhead);
			if(nextelement.className==subheader) {
				thissubheadtext = nextelement.innerHTML;

				if(thissubheadtext.substring(0,1)=="(") {
					thischaptertext = thischaptertext + ' ' + thissubheadtext;
				} else {
					thischaptertext = thischaptertext + ': '+thissubheadtext;
				}
			}
		}

		output = output + '<li><a href="#'+thischapterid+'">' + thischaptertext + "</a></li>\n";
	}
	output = textcleaner(output);
	return output;
}


/* flip toc on and off */

function createtoc() {
	var tocsection = getByClass("toc",document)[0];
	var existingtoc = document.getElementById("insertedtoc");
	if(existingtoc) {
    // toc exists, remove it
    tocsection.removeChild(existingtoc);
  } else {
    // create toc section
    var sectionheads = getByClass("sectionhead",document);
    var poemtitles = getByClass("poemtitle",document);
    var everything = "";

    if(poemtitles[0]) {
    	everything = everything + makelistsubtitles(poemtitles,"poemsubtitle");
    } else {

	    if(sectionheads[0]) {
	     // if there are sectionheads, make indented list

	    	everything = everything + makelist(sectionheads,"chapterhead");
		  } else {
		  	//use single-layer list for chapterheads
		    var chapterheads = getByClass("chapterhead",document);
			  if(chapterheads[0]) {
			  	everything = everything + makelistsubtitles(chapterheads,"chaptersubhead");
			  } else {
			  		alert("no chapter heads");
			  }
			}

		}
		  
	    var tocinsert = document.createElement("ol");
	    if(numbersoff) {
	    	tocinsert.setAttribute("class","noprefix")
	    } else {
		  	tocinsert.setAttribute("class","romantoc");
		  }
		  tocinsert.setAttribute("id","insertedtoc");
		  tocinsert.innerHTML = everything;

		  tocsection.appendChild(tocinsert);

	
  }
}

/* initialize */

window.onload = function startup() {
	// hide toc if no sectionheads, poemtitles, or chapterheads
	var tocsection = getByClass("toc",document)[0];
  var sectionheads = getByClass("sectionhead",document);
  var poemtitles = getByClass("poemtitle",document);
	var chapterheads = getByClass("chapterhead",document);
	if(sectionheads[0] || poemtitles[0] || chapterheads[0] ) {
		tocsection.style.display = "block";
	} else {
		tocsection.style.display = "none";		
	}
	// Create toc link – this vacuums out tocheader's content
	// Maybe have this insert all of TOC section? Could be useful later.

	var tocheader = tocsection.firstChild;
	tocheader.innerHTML = "";
	var a = document.createElement('a')
	a.setAttribute('href','javascript:createtoc();');
	a.innerHTML = "Contents";
	tocheader.appendChild(a);

	// hide all footnotes + create anchors + ids

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

