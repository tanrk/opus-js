
var internetExplorer=document.selection&&window.ActiveXObject&&/MSIE/.test(navigator.userAgent);var webkit=/AppleWebKit/.test(navigator.userAgent);function method(obj,name){return function(){obj[name].apply(obj,arguments);};}
var StopIteration={toString:function(){return"StopIteration"}};function forEach(iter,f){if(iter.next){try{while(true)f(iter.next());}
catch(e){if(e!=StopIteration)throw e;}}
else{for(var i=0;i<iter.length;i++)
f(iter[i]);}}
function map(iter,f){var accum=[];forEach(iter,function(val){accum.push(f(val));});return accum;}
function matcher(regexp){return function(value){return regexp.test(value);};}
function hasClass(element,className){var classes=element.className;return classes&&new RegExp("(^| )"+className+"($| )").test(classes);}
function insertAfter(newNode,oldNode){var parent=oldNode.parentNode;parent.insertBefore(newNode,oldNode.nextSibling);return newNode;}
function removeElement(node){if(node.parentNode)
node.parentNode.removeChild(node);}
function clearElement(node){while(node.firstChild)
node.removeChild(node.firstChild);}
function isAncestor(node,child){while(child=child.parentNode){if(node==child)
return true;}
return false;}
var nbsp="\u00a0";var matching={"{":"}","[":"]","(":")","}":"{","]":"[",")":"("};function normalizeEvent(event){if(!event.stopPropagation){event.stopPropagation=function(){this.cancelBubble=true;};event.preventDefault=function(){this.returnValue=false;};}
if(!event.stop){event.stop=function(){this.stopPropagation();this.preventDefault();};}
if(event.type=="keypress"){event.code=(event.charCode==null)?event.keyCode:event.charCode;event.character=String.fromCharCode(event.code);}
return event;}
function addEventHandler(node,type,handler,removeFunc){function wrapHandler(event){handler(normalizeEvent(event||window.event));}
if(typeof node.addEventListener=="function"){node.addEventListener(type,wrapHandler,false);if(removeFunc)return function(){node.removeEventListener(type,wrapHandler,false);};}
else{node.attachEvent("on"+type,wrapHandler);if(removeFunc)return function(){node.detachEvent("on"+type,wrapHandler);};}}
function nodeText(node){return node.innerText||node.textContent||node.nodeValue||"";}
window.stringStream=function(source){var current="";var pos=0;var accum="";function ensureChars(){while(pos==current.length){accum+=current;current="";pos=0;try{current=source.next();}
catch(e){if(e!=StopIteration)throw e;else return false;}}
return true;}
return{peek:function(){if(!ensureChars())return null;return current.charAt(pos);},next:function(){if(!ensureChars()){if(accum.length>0)
throw"End of stringstream reached without emptying buffer ('"+accum+"').";else
throw StopIteration;}
return current.charAt(pos++);},get:function(){var temp=accum;accum="";if(pos>0){temp+=current.slice(0,pos);current=current.slice(pos);pos=0;}
return temp;},push:function(str){current=current.slice(0,pos)+str+current.slice(pos);},lookAhead:function(str,consume,skipSpaces,caseInsensitive){function cased(str){return caseInsensitive?str.toLowerCase():str;}
str=cased(str);var found=false;var _accum=accum,_pos=pos;if(skipSpaces)this.nextWhileMatches(/[\s\u00a0]/);while(true){var end=pos+str.length,left=current.length-pos;if(end<=current.length){found=str==cased(current.slice(pos,end));pos=end;break;}
else if(str.slice(0,left)==cased(current.slice(pos))){accum+=current;current="";try{current=source.next();}
catch(e){break;}
pos=0;str=str.slice(left);}
else{break;}}
if(!(found&&consume)){current=accum.slice(_accum.length)+current;pos=_pos;accum=_accum;}
return found;},more:function(){return this.peek()!==null;},applies:function(test){var next=this.peek();return(next!==null&&test(next));},nextWhile:function(test){var next;while((next=this.peek())!==null&&test(next))
this.next();},matches:function(re){var next=this.peek();return(next!==null&&re.test(next));},nextWhileMatches:function(re){var next;while((next=this.peek())!==null&&re.test(next))
this.next();},equals:function(ch){return ch===this.peek();},endOfLine:function(){var next=this.peek();return next==null||next=="\n";}};};var select={};(function(){select.ie_selection=document.selection&&document.selection.createRangeCollection;function topLevelNodeAt(node,top){while(node&&node.parentNode!=top)
node=node.parentNode;return node;}
function topLevelNodeBefore(node,top){while(!node.previousSibling&&node.parentNode!=top)
node=node.parentNode;return topLevelNodeAt(node.previousSibling,top);}
var currentSelection=null;var fourSpaces="\u00a0\u00a0\u00a0\u00a0";select.snapshotChanged=function(){if(currentSelection)currentSelection.changed=true;};select.snapshotReplaceNode=function(from,to,length,offset){if(!currentSelection)return;currentSelection.changed=true;function replace(point){if(from==point.node){if(length&&point.offset>length){point.offset-=length;}
else{point.node=to;point.offset+=(offset||0);}}}
replace(currentSelection.start);replace(currentSelection.end);};select.snapshotMove=function(from,to,distance,relative,ifAtStart){if(!currentSelection)return;currentSelection.changed=true;function move(point){if(from==point.node&&(!ifAtStart||point.offset==0)){point.node=to;if(relative)point.offset=Math.max(0,point.offset+distance);else point.offset=distance;}}
move(currentSelection.start);move(currentSelection.end);};if(select.ie_selection){function selectionNode(win,start){var range=win.document.selection.createRange();range.collapse(start);function nodeAfter(node){var found=null;while(!found&&node){found=node.nextSibling;node=node.parentNode;}
return nodeAtStartOf(found);}
function nodeAtStartOf(node){while(node&&node.firstChild)node=node.firstChild;return{node:node,offset:0};}
var containing=range.parentElement();if(!isAncestor(win.document.body,containing))return null;if(!containing.firstChild)return nodeAtStartOf(containing);var working=range.duplicate();working.moveToElementText(containing);working.collapse(true);for(var cur=containing.firstChild;cur;cur=cur.nextSibling){if(cur.nodeType==3){var size=cur.nodeValue.length;working.move("character",size);}
else{working.moveToElementText(cur);working.collapse(false);}
var dir=range.compareEndPoints("StartToStart",working);if(dir==0)return nodeAfter(cur);if(dir==1)continue;if(cur.nodeType!=3)return nodeAtStartOf(cur);working.setEndPoint("StartToEnd",range);return{node:cur,offset:size-working.text.length};}
return nodeAfter(containing);}
select.markSelection=function(win){currentSelection=null;var sel=win.document.selection;if(!sel)return;var start=selectionNode(win,true),end=selectionNode(win,false);if(!start||!end)return;currentSelection={start:start,end:end,window:win,changed:false};};select.selectMarked=function(){if(!currentSelection||!currentSelection.changed)return;function makeRange(point){var range=currentSelection.window.document.body.createTextRange();var node=point.node;if(!node){range.moveToElementText(currentSelection.window.document.body);range.collapse(false);}
else if(node.nodeType==3){range.moveToElementText(node.parentNode);var offset=point.offset;while(node.previousSibling){node=node.previousSibling;offset+=(node.innerText||"").length;}
range.move("character",offset);}
else{range.moveToElementText(node);range.collapse(true);}
return range;}
var start=makeRange(currentSelection.start),end=makeRange(currentSelection.end);start.setEndPoint("StartToEnd",end);start.select();};select.selectionTopNode=function(container,start){var selection=container.ownerDocument.selection;if(!selection)return false;var range=selection.createRange();range.collapse(start);var around=range.parentElement();if(around&&isAncestor(container,around)){var range2=range.duplicate();range2.moveToElementText(around);if(range.compareEndPoints("StartToStart",range2)==-1)
return topLevelNodeAt(around,container);}
try{range.pasteHTML("<span id='xxx-temp-xxx'></span>");}
catch(e){return false;}
var temp=container.ownerDocument.getElementById("xxx-temp-xxx");if(temp){var result=topLevelNodeBefore(temp,container);removeElement(temp);return result;}
return false;};select.focusAfterNode=function(node,container){var range=container.ownerDocument.body.createTextRange();range.moveToElementText(node||container);range.collapse(!node);range.select();};select.somethingSelected=function(win){var sel=win.document.selection;return sel&&(sel.createRange().text!="");};function insertAtCursor(window,html){var selection=window.document.selection;if(selection){var range=selection.createRange();range.pasteHTML(html);range.collapse(false);range.select();}}
select.insertNewlineAtCursor=function(window){insertAtCursor(window,"<br>");};select.insertTabAtCursor=function(window){insertAtCursor(window,fourSpaces);};select.cursorPos=function(container,start){var selection=container.ownerDocument.selection;if(!selection)return null;var topNode=select.selectionTopNode(container,start);while(topNode&&topNode.nodeName!="BR")
topNode=topNode.previousSibling;var range=selection.createRange(),range2=range.duplicate();range.collapse(start);if(topNode){range2.moveToElementText(topNode);range2.collapse(false);}
else{try{range2.moveToElementText(container);}
catch(e){return null;}
range2.collapse(true);}
range.setEndPoint("StartToStart",range2);return{node:topNode,offset:range.text.length};};select.setCursorPos=function(container,from,to){function rangeAt(pos){var range=container.ownerDocument.body.createTextRange();if(!pos.node){range.moveToElementText(container);range.collapse(true);}
else{range.moveToElementText(pos.node);range.collapse(false);}
range.move("character",pos.offset);return range;}
var range=rangeAt(from);if(to&&to!=from)
range.setEndPoint("EndToEnd",rangeAt(to));range.select();}
select.scrollToCursor=function(container){var selection=container.ownerDocument.selection;if(!selection)return null;selection.createRange().scrollIntoView();};select.scrollToNode=function(node){if(!node)return;node.scrollIntoView();};select.selectionCoords=function(win){var selection=win.document.selection;if(!selection)return null;var start=selection.createRange(),end=start.duplicate();start.collapse(true);end.collapse(false);var body=win.document.body;return{start:{x:start.boundingLeft+body.scrollLeft-1,y:start.boundingTop+body.scrollTop},end:{x:end.boundingLeft+body.scrollLeft-1,y:end.boundingTop+body.scrollTop}};};select.selectCoords=function(win,coords){if(!coords)return;var range1=win.document.body.createTextRange(),range2=range1.duplicate();try{range1.moveToPoint(coords.start.x,coords.start.y);range2.moveToPoint(coords.end.x,coords.end.y);range1.setEndPoint("EndToStart",range2);range1.select();}catch(e){alert(e.message);}};}
else{select.markSelection=function(win){var selection=win.getSelection();if(!selection||selection.rangeCount==0)
return(currentSelection=null);var range=selection.getRangeAt(0);currentSelection={start:{node:range.startContainer,offset:range.startOffset},end:{node:range.endContainer,offset:range.endOffset},window:win,changed:false};function normalize(point){while(point.node.nodeType!=3&&point.node.nodeName!="BR"){var newNode=point.node.childNodes[point.offset]||point.node.nextSibling;point.offset=0;while(!newNode&&point.node.parentNode){point.node=point.node.parentNode;newNode=point.node.nextSibling;}
point.node=newNode;if(!newNode)
break;}}
normalize(currentSelection.start);normalize(currentSelection.end);};select.selectMarked=function(){if(!currentSelection||!currentSelection.changed)return;var win=currentSelection.window,range=win.document.createRange();function setPoint(point,which){if(point.node){if(point.offset==0)
range["set"+which+"Before"](point.node);else
range["set"+which](point.node,point.offset);}
else{range.setStartAfter(win.document.body.lastChild||win.document.body);}}
setPoint(currentSelection.end,"End");setPoint(currentSelection.start,"Start");selectRange(range,win);};function selectRange(range,window){var selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);};function selectionRange(window){var selection=window.getSelection();if(!selection||selection.rangeCount==0)
return false;else
return selection.getRangeAt(0);}
select.selectionTopNode=function(container,start){var range=selectionRange(container.ownerDocument.defaultView);if(!range)return false;var node=start?range.startContainer:range.endContainer;var offset=start?range.startOffset:range.endOffset;if(window.opera&&!start&&range.endContainer==container&&range.endOffset==range.startOffset+1&&container.childNodes[range.startOffset]&&container.childNodes[range.startOffset].nodeName=="BR")
offset--;if(node.nodeType==3){if(offset>0)
return topLevelNodeAt(node,container);else
return topLevelNodeBefore(node,container);}
else if(node.nodeName=="HTML"){return(offset==1?null:container.lastChild);}
else if(node==container){return(offset==0)?null:node.childNodes[offset-1];}
else{if(offset==node.childNodes.length)
return topLevelNodeAt(node,container);else if(offset==0)
return topLevelNodeBefore(node,container);else
return topLevelNodeAt(node.childNodes[offset-1],container);}};select.focusAfterNode=function(node,container){var win=container.ownerDocument.defaultView,range=win.document.createRange();range.setStartBefore(container.firstChild||container);if(node&&!node.firstChild)
range.setEndAfter(node);else if(node)
range.setEnd(node,node.childNodes.length);else
range.setEndBefore(container.firstChild||container);range.collapse(false);selectRange(range,win);};select.somethingSelected=function(win){var range=selectionRange(win);return range&&!range.collapsed;};function insertNodeAtCursor(window,node){var range=selectionRange(window);if(!range)return;range.deleteContents();range.insertNode(node);webkitLastLineHack(window.document.body);range=window.document.createRange();range.selectNode(node);range.collapse(false);selectRange(range,window);}
select.insertNewlineAtCursor=function(window){insertNodeAtCursor(window,window.document.createElement("BR"));};select.insertTabAtCursor=function(window){insertNodeAtCursor(window,window.document.createTextNode(fourSpaces));};select.cursorPos=function(container,start){var range=selectionRange(window);if(!range)return;var topNode=select.selectionTopNode(container,start);while(topNode&&topNode.nodeName!="BR")
topNode=topNode.previousSibling;range=range.cloneRange();range.collapse(start);if(topNode)
range.setStartAfter(topNode);else
range.setStartBefore(container);return{node:topNode,offset:range.toString().length};};select.setCursorPos=function(container,from,to){var win=container.ownerDocument.defaultView,range=win.document.createRange();function setPoint(node,offset,side){if(!node)
node=container.firstChild;else
node=node.nextSibling;if(!node)
return;if(offset==0){range["set"+side+"Before"](node);return true;}
var backlog=[]
function decompose(node){if(node.nodeType==3)
backlog.push(node);else
forEach(node.childNodes,decompose);}
while(true){while(node&&!backlog.length){decompose(node);node=node.nextSibling;}
var cur=backlog.shift();if(!cur)return false;var length=cur.nodeValue.length;if(length>=offset){range["set"+side](cur,offset);return true;}
offset-=length;}}
to=to||from;if(setPoint(to.node,to.offset,"End")&&setPoint(from.node,from.offset,"Start"))
selectRange(range,win);};select.scrollToNode=function(element){if(!element)return;var doc=element.ownerDocument,body=doc.body,win=doc.defaultView,html=doc.documentElement;while(element&&!element.offsetTop)
element=element.previousSibling;var y=0,pos=element;while(pos&&pos.offsetParent){y+=pos.offsetTop;pos=pos.offsetParent;}
var screen_y=y-(body.scrollTop||html.scrollTop||0);if(screen_y<0||screen_y>win.innerHeight-30)
win.scrollTo(body.scrollLeft||html.scrollLeft||0,y);};select.scrollToCursor=function(container){select.scrollToNode(select.selectionTopNode(container,true)||container.firstChild);};}})();function History(container,maxDepth,commitDelay,editor,onChange){this.container=container;this.maxDepth=maxDepth;this.commitDelay=commitDelay;this.editor=editor;this.parent=editor.parent;this.onChange=onChange;var initial={text:"",from:null,to:null};this.first=initial;this.last=initial;this.firstTouched=false;this.history=[];this.redoHistory=[];this.touched=[];}
History.prototype={scheduleCommit:function(){var self=this;this.parent.clearTimeout(this.commitTimeout);this.commitTimeout=this.parent.setTimeout(function(){self.tryCommit();},this.commitDelay);},touch:function(node){this.setTouched(node);this.scheduleCommit();},undo:function(){this.commit();if(this.history.length){var item=this.history.pop();this.redoHistory.push(this.updateTo(item,"applyChain"));if(this.onChange)this.onChange();return this.chainNode(item);}},redo:function(){this.commit();if(this.redoHistory.length){var item=this.redoHistory.pop();this.addUndoLevel(this.updateTo(item,"applyChain"));if(this.onChange)this.onChange();return this.chainNode(item);}},clear:function(){this.history=[];this.redoHistory=[];},historySize:function(){return{undo:this.history.length,redo:this.redoHistory.length};},push:function(from,to,lines){var chain=[];for(var i=0;i<lines.length;i++){var end=(i==lines.length-1)?to:this.container.ownerDocument.createElement("BR");chain.push({from:from,to:end,text:cleanText(lines[i])});from=end;}
this.pushChains([chain],from==null&&to==null);},pushChains:function(chains,doNotHighlight){this.commit(doNotHighlight);this.addUndoLevel(this.updateTo(chains,"applyChain"));this.redoHistory=[];},chainNode:function(chains){for(var i=0;i<chains.length;i++){var start=chains[i][0],node=start&&(start.from||start.to);if(node)return node;}},reset:function(){this.history=[];this.redoHistory=[];},textAfter:function(br){return this.after(br).text;},nodeAfter:function(br){return this.after(br).to;},nodeBefore:function(br){return this.before(br).from;},tryCommit:function(){if(!window.History)return;if(this.editor.highlightDirty())this.commit();else this.scheduleCommit();},commit:function(doNotHighlight){this.parent.clearTimeout(this.commitTimeout);if(!doNotHighlight)this.editor.highlightDirty(true);var chains=this.touchedChains(),self=this;if(chains.length){this.addUndoLevel(this.updateTo(chains,"linkChain"));this.redoHistory=[];if(this.onChange)this.onChange();}},updateTo:function(chains,updateFunc){var shadows=[],dirty=[];for(var i=0;i<chains.length;i++){shadows.push(this.shadowChain(chains[i]));dirty.push(this[updateFunc](chains[i]));}
if(updateFunc=="applyChain")
this.notifyDirty(dirty);return shadows;},notifyDirty:function(nodes){forEach(nodes,method(this.editor,"addDirtyNode"))
this.editor.scheduleHighlight();},linkChain:function(chain){for(var i=0;i<chain.length;i++){var line=chain[i];if(line.from)line.from.historyAfter=line;else this.first=line;if(line.to)line.to.historyBefore=line;else this.last=line;}},after:function(node){return node?node.historyAfter:this.first;},before:function(node){return node?node.historyBefore:this.last;},setTouched:function(node){if(node){if(!node.historyTouched){this.touched.push(node);node.historyTouched=true;}}
else{this.firstTouched=true;}},addUndoLevel:function(diffs){this.history.push(diffs);if(this.history.length>this.maxDepth)
this.history.shift();},touchedChains:function(){var self=this;var nullTemp=null;function temp(node){return node?node.historyTemp:nullTemp;}
function setTemp(node,line){if(node)node.historyTemp=line;else nullTemp=line;}
function buildLine(node){var text=[];for(var cur=node?node.nextSibling:self.container.firstChild;cur&&cur.nodeName!="BR";cur=cur.nextSibling)
if(cur.currentText)text.push(cur.currentText);return{from:node,to:cur,text:cleanText(text.join(""))};}
var lines=[];if(self.firstTouched)self.touched.push(null);forEach(self.touched,function(node){if(node&&node.parentNode!=self.container)return;if(node)node.historyTouched=false;else self.firstTouched=false;var line=buildLine(node),shadow=self.after(node);if(!shadow||shadow.text!=line.text||shadow.to!=line.to){lines.push(line);setTemp(node,line);}});function nextBR(node,dir){var link=dir+"Sibling",search=node[link];while(search&&search.nodeName!="BR")
search=search[link];return search;}
var chains=[];self.touched=[];forEach(lines,function(line){if(!temp(line.from))return;var chain=[],curNode=line.from,safe=true;while(true){var curLine=temp(curNode);if(!curLine){if(safe)break;else curLine=buildLine(curNode);}
chain.unshift(curLine);setTemp(curNode,null);if(!curNode)break;safe=self.after(curNode);curNode=nextBR(curNode,"previous");}
curNode=line.to;safe=self.before(line.from);while(true){if(!curNode)break;var curLine=temp(curNode);if(!curLine){if(safe)break;else curLine=buildLine(curNode);}
chain.push(curLine);setTemp(curNode,null);safe=self.before(curNode);curNode=nextBR(curNode,"next");}
chains.push(chain);});return chains;},shadowChain:function(chain){var shadows=[],next=this.after(chain[0].from),end=chain[chain.length-1].to;while(true){shadows.push(next);var nextNode=next.to;if(!nextNode||nextNode==end)
break;else
next=nextNode.historyAfter||this.before(end);}
return shadows;},applyChain:function(chain){var cursor=select.cursorPos(this.container,false),self=this;function removeRange(from,to){var pos=from?from.nextSibling:self.container.firstChild;while(pos!=to){var temp=pos.nextSibling;removeElement(pos);pos=temp;}}
var start=chain[0].from,end=chain[chain.length-1].to;removeRange(start,end);for(var i=0;i<chain.length;i++){var line=chain[i];if(i>0)
self.container.insertBefore(line.from,end);var node=makePartSpan(fixSpaces(line.text),this.container.ownerDocument);self.container.insertBefore(node,end);if(cursor&&cursor.node==line.from){var cursordiff=0;var prev=this.after(line.from);if(prev&&i==chain.length-1){for(var match=0;match<cursor.offset&&line.text.charAt(match)==prev.text.charAt(match);match++);if(cursor.offset>match)
cursordiff=line.text.length-prev.text.length;}
select.setCursorPos(this.container,{node:line.from,offset:Math.max(0,cursor.offset+cursordiff)});}
else if(cursor&&(i==chain.length-1)&&cursor.node&&cursor.node.parentNode!=this.container){select.setCursorPos(this.container,{node:line.from,offset:line.text.length});}}
this.linkChain(chain);return start;}};function makeWhiteSpace(n){var buffer=[],nb=true;for(;n>0;n--){buffer.push((nb||n==1)?nbsp:" ");nb=!nb;}
return buffer.join("");}
function fixSpaces(string){if(string.charAt(0)==" ")string=nbsp+string.slice(1);return string.replace(/\t/g,function(){return makeWhiteSpace(indentUnit);}).replace(/[ \u00a0]{2,}/g,function(s){return makeWhiteSpace(s.length);});}
function cleanText(text){return text.replace(/\u00a0/g," ").replace(/\u200b/g,"");}
function makePartSpan(value,doc){var text=value;if(value.nodeType==3)text=value.nodeValue;else value=doc.createTextNode(text);var span=doc.createElement("SPAN");span.isPart=true;span.appendChild(value);span.currentText=text;return span;}
var webkitLastLineHack=webkit?function(container){var last=container.lastChild;if(!last||!last.isPart||last.textContent!="\u200b")
container.appendChild(makePartSpan("\u200b",container.ownerDocument));}:function(){};var Editor=(function(){var newlineElements={"P":true,"DIV":true,"LI":true};function asEditorLines(string){var tab=makeWhiteSpace(indentUnit);return map(string.replace(/\t/g,tab).replace(/\u00a0/g," ").replace(/\r\n?/g,"\n").split("\n"),fixSpaces);}
function simplifyDOM(root){var doc=root.ownerDocument;var result=[];var leaving=true;function simplifyNode(node){if(node.nodeType==3){var text=node.nodeValue=fixSpaces(node.nodeValue.replace(/[\r\u200b]/g,"").replace(/\n/g," "));if(text.length)leaving=false;result.push(node);}
else if(node.nodeName=="BR"&&node.childNodes.length==0){leaving=true;result.push(node);}
else{forEach(node.childNodes,simplifyNode);if(!leaving&&newlineElements.hasOwnProperty(node.nodeName)){leaving=true;result.push(doc.createElement("BR"));}}}
simplifyNode(root);return result;}
function traverseDOM(start){function yield(value,c){cc=c;return value;}
function push(fun,arg,c){return function(){return fun(arg,c);};}
function stop(){cc=stop;throw StopIteration;};var cc=push(scanNode,start,stop);var owner=start.ownerDocument;var nodeQueue=[];function pointAt(node){var parent=node.parentNode;var next=node.nextSibling;return function(newnode){parent.insertBefore(newnode,next);};}
var point=null;function insertPart(part){var text="\n";if(part.nodeType==3){select.snapshotChanged();part=makePartSpan(part,owner);text=part.currentText;}
part.dirty=true;nodeQueue.push(part);point(part);return text;}
function writeNode(node,c){var toYield=[];forEach(simplifyDOM(node),function(part){toYield.push(insertPart(part));});return yield(toYield.join(""),c);}
function partNode(node){if(node.isPart&&node.childNodes.length==1&&node.firstChild.nodeType==3){node.currentText=node.firstChild.nodeValue;return!/[\n\t\r]/.test(node.currentText);}
return false;}
function scanNode(node,c){if(node.nextSibling)
c=push(scanNode,node.nextSibling,c);if(partNode(node)){nodeQueue.push(node);return yield(node.currentText,c);}
else if(node.nodeName=="BR"){nodeQueue.push(node);return yield("\n",c);}
else{point=pointAt(node);removeElement(node);return writeNode(node,c);}}
return{next:function(){return cc();},nodes:nodeQueue};}
function nodeSize(node){if(node.nodeName=="BR")
return 1;else
return node.currentText.length;}
function startOfLine(node){while(node&&node.nodeName!="BR")node=node.previousSibling;return node;}
function endOfLine(node,container){if(!node)node=container.firstChild;else if(node.nodeName=="BR")node=node.nextSibling;while(node&&node.nodeName!="BR")node=node.nextSibling;return node;}
function time(){return new Date().getTime();}
function scrubPasted(container,start,start2){var end=select.selectionTopNode(container,true),doc=container.ownerDocument;if(start!=null&&start.parentNode!=container)start=start2;if(start===false)start=null;if(start==end||!end||!container.firstChild)return;var clear=traverseDOM(start?start.nextSibling:container.firstChild);while(end.parentNode==container)try{clear.next();}catch(e){break;}
forEach(clear.nodes,function(node){var newNode=node.nodeName=="BR"?doc.createElement("BR"):makePartSpan(node.currentText,doc);container.replaceChild(newNode,node);});}
function SearchCursor(editor,string,fromCursor){this.editor=editor;this.history=editor.history;this.history.commit();this.atOccurrence=false;this.fallbackSize=15;var cursor;if(fromCursor&&(cursor=select.cursorPos(this.editor.container))){this.line=cursor.node;this.offset=cursor.offset;}
else{this.line=null;this.offset=0;}
this.valid=!!string;var target=string.split("\n"),self=this;this.matches=(target.length==1)?function(){var match=cleanText(self.history.textAfter(self.line).slice(self.offset)).indexOf(string);if(match>-1)
return{from:{node:self.line,offset:self.offset+match},to:{node:self.line,offset:self.offset+match+string.length}};}:function(){var firstLine=cleanText(self.history.textAfter(self.line).slice(self.offset));var match=firstLine.lastIndexOf(target[0]);if(match==-1||match!=firstLine.length-target[0].length)
return false;var startOffset=self.offset+match;var line=self.history.nodeAfter(self.line);for(var i=1;i<target.length-1;i++){if(cleanText(self.history.textAfter(line))!=target[i])
return false;line=self.history.nodeAfter(line);}
if(cleanText(self.history.textAfter(line)).indexOf(target[target.length-1])!=0)
return false;return{from:{node:self.line,offset:startOffset},to:{node:line,offset:target[target.length-1].length}};};}
SearchCursor.prototype={findNext:function(){if(!this.valid)return false;this.atOccurrence=false;var self=this;if(this.line&&!this.line.parentNode){this.line=null;this.offset=0;}
function saveAfter(pos){if(self.history.textAfter(pos.node).length<pos.offset){self.line=pos.node;self.offset=pos.offset+1;}
else{self.line=self.history.nodeAfter(pos.node);self.offset=0;}}
while(true){var match=this.matches();if(match){this.atOccurrence=match;saveAfter(match.from);return true;}
this.line=this.history.nodeAfter(this.line);this.offset=0;if(!this.line){this.valid=false;return false;}}},select:function(){if(this.atOccurrence){select.setCursorPos(this.editor.container,this.atOccurrence.from,this.atOccurrence.to);select.scrollToCursor(this.editor.container);}},replace:function(string){if(this.atOccurrence){var end=this.editor.replaceRange(this.atOccurrence.from,this.atOccurrence.to,string);this.line=end.node;this.offset=end.offset;this.atOccurrence=false;}}};function Editor(options){this.options=options;window.indentUnit=options.indentUnit;this.parent=parent;this.doc=document;var container=this.container=this.doc.body;this.win=window;this.history=new History(container,options.undoDepth,options.undoDelay,this,options.onChange);var self=this;if(!Editor.Parser)
throw"No parser loaded.";if(options.parserConfig&&Editor.Parser.configure)
Editor.Parser.configure(options.parserConfig);if(!options.readOnly)
select.setCursorPos(container,{node:null,offset:0});this.dirty=[];if(options.content)
this.importCode(options.content);else
container.appendChild(this.doc.createElement("BR"));if(!options.readOnly){if(options.continuousScanning!==false){this.scanner=this.documentScanner(options.passTime);this.delayScanning();}
function setEditable(){if(document.body.contentEditable!=undefined&&internetExplorer)
document.body.contentEditable="true";else
document.designMode="on";document.documentElement.style.borderWidth="0";if(!options.textWrapping)
container.style.whiteSpace="nowrap";}
try{setEditable();}
catch(e){var focusEvent=addEventHandler(document,"focus",function(){focusEvent();setEditable();},true);}
addEventHandler(document,"keydown",method(this,"keyDown"));addEventHandler(document,"keypress",method(this,"keyPress"));addEventHandler(document,"keyup",method(this,"keyUp"));function cursorActivity(){self.cursorActivity(false);}
addEventHandler(document.body,"mouseup",cursorActivity);addEventHandler(document.body,"paste",function(event){cursorActivity();if(internetExplorer){var text=null;try{text=window.clipboardData.getData("Text");}catch(e){}
if(text!=null){self.replaceSelection(text);event.stop();}
else{var start=select.selectionTopNode(self.container,true),start2=start&&start.previousSibling;setTimeout(function(){scrubPasted(self.container,start,start2);},0);}}});addEventHandler(document.body,"cut",cursorActivity);if(this.options.autoMatchParens)
addEventHandler(document.body,"click",method(this,"scheduleParenBlink"));}
else if(!options.textWrapping){container.style.whiteSpace="nowrap";}}
function isSafeKey(code){return(code>=16&&code<=18)||(code>=33&&code<=40);}
Editor.prototype={importCode:function(code){this.history.push(null,null,asEditorLines(code));this.history.reset();},getCode:function(){if(!this.container.firstChild)
return"";var accum=[];select.markSelection(this.win);forEach(traverseDOM(this.container.firstChild),method(accum,"push"));webkitLastLineHack(this.container);select.selectMarked();return cleanText(accum.join(""));},checkLine:function(node){if(node===false||!(node==null||node.parentNode==this.container))
throw parent.CodeMirror.InvalidLineHandle;},cursorPosition:function(start){if(start==null)start=true;var pos=select.cursorPos(this.container,start);if(pos)return{line:pos.node,character:pos.offset};else return{line:null,character:0};},firstLine:function(){return null;},lastLine:function(){if(this.container.lastChild)return startOfLine(this.container.lastChild);else return null;},nextLine:function(line){this.checkLine(line);var end=endOfLine(line,this.container);return end||false;},prevLine:function(line){this.checkLine(line);if(line==null)return false;return startOfLine(line.previousSibling);},selectLines:function(startLine,startOffset,endLine,endOffset){this.checkLine(startLine);var start={node:startLine,offset:startOffset},end=null;if(endOffset!==undefined){this.checkLine(endLine);end={node:endLine,offset:endOffset};}
select.setCursorPos(this.container,start,end);select.scrollToCursor(this.container);},lineContent:function(line){this.checkLine(line);var accum=[];for(line=line?line.nextSibling:this.container.firstChild;line&&line.nodeName!="BR";line=line.nextSibling)
accum.push(nodeText(line));return cleanText(accum.join(""));},setLineContent:function(line,content){this.history.commit();this.replaceRange({node:line,offset:0},{node:line,offset:this.history.textAfter(line).length},content);this.addDirtyNode(line);this.scheduleHighlight();},insertIntoLine:function(line,position,content){var before=null;if(position=="end"){before=endOfLine(line,this.container);}
else{for(var cur=line?line.nextSibling:this.container.firstChild;cur;cur=cur.nextSibling){if(position==0){before=cur;break;}
var text=(cur.innerText||cur.textContent||cur.nodeValue||"");if(text.length>position){before=cur.nextSibling;content=text.slice(0,position)+content+text.slice(position);removeElement(cur);break;}
position-=text.length;}}
var lines=asEditorLines(content),doc=this.container.ownerDocument;for(var i=0;i<lines.length;i++){if(i>0)this.container.insertBefore(doc.createElement("BR"),before);this.container.insertBefore(makePartSpan(lines[i],doc),before);}
this.addDirtyNode(line);this.scheduleHighlight();},selectedText:function(){var h=this.history;h.commit();var start=select.cursorPos(this.container,true),end=select.cursorPos(this.container,false);if(!start||!end)return"";if(start.node==end.node)
return h.textAfter(start.node).slice(start.offset,end.offset);var text=[h.textAfter(start.node).slice(start.offset)];for(var pos=h.nodeAfter(start.node);pos!=end.node;pos=h.nodeAfter(pos))
text.push(h.textAfter(pos));text.push(h.textAfter(end.node).slice(0,end.offset));return cleanText(text.join("\n"));},replaceSelection:function(text){this.history.commit();var start=select.cursorPos(this.container,true),end=select.cursorPos(this.container,false);if(!start||!end)return;end=this.replaceRange(start,end,text);select.setCursorPos(this.container,start,end);},replaceRange:function(from,to,text){var lines=asEditorLines(text);lines[0]=this.history.textAfter(from.node).slice(0,from.offset)+lines[0];var lastLine=lines[lines.length-1];lines[lines.length-1]=lastLine+this.history.textAfter(to.node).slice(to.offset);var end=this.history.nodeAfter(to.node);this.history.push(from.node,end,lines);return{node:this.history.nodeBefore(end),offset:lastLine.length};},getSearchCursor:function(string,fromCursor){return new SearchCursor(this,string,fromCursor);},reindent:function(){if(this.container.firstChild)
this.indentRegion(null,this.container.lastChild);},reindentSelection:function(direction){if(!select.somethingSelected(this.win)){this.indentAtCursor(direction);}
else{var start=select.selectionTopNode(this.container,true),end=select.selectionTopNode(this.container,false);if(start===false||end===false)return;this.indentRegion(start,end,direction);}},grabKeys:function(eventHandler,filter){this.frozen=eventHandler;this.keyFilter=filter;},ungrabKeys:function(){this.frozen="leave";this.keyFilter=null;},setParser:function(name){Editor.Parser=window[name];if(this.container.firstChild){forEach(this.container.childNodes,function(n){if(n.nodeType!=3)n.dirty=true;});this.addDirtyNode(this.firstChild);this.scheduleHighlight();}},keyDown:function(event){if(this.frozen=="leave")this.frozen=null;if(this.frozen&&(!this.keyFilter||this.keyFilter(event.keyCode))){event.stop();this.frozen(event);return;}
var code=event.keyCode;this.delayScanning();if(this.options.autoMatchParens)
this.scheduleParenBlink();if(code==13){if(event.ctrlKey&&!event.altKey){this.reparseBuffer();}
else{select.insertNewlineAtCursor(this.win);this.indentAtCursor();select.scrollToCursor(this.container);}
event.stop();}
else if(code==9&&this.options.tabMode!="default"){this.handleTab(!event.ctrlKey&&!event.shiftKey);event.stop();}
else if(code==32&&event.shiftKey&&this.options.tabMode=="default"){this.handleTab(true);event.stop();}
else if(code==36&&!event.shiftKey){if(this.home())
event.stop();}
else if((code==219||code==221)&&event.ctrlKey&&!event.altKey){this.blinkParens(event.shiftKey);event.stop();}
else if(event.metaKey&&!event.shiftKey&&(code==37||code==39)){var cursor=select.selectionTopNode(this.container);if(cursor===false||!this.container.firstChild)return;if(code==37)select.focusAfterNode(startOfLine(cursor),this.container);else{var end=endOfLine(cursor,this.container);select.focusAfterNode(end?end.previousSibling:this.container.lastChild,this.container);}
event.stop();}
else if((event.ctrlKey||event.metaKey)&&!event.altKey){if((event.shiftKey&&code==90)||code==89){select.scrollToNode(this.history.redo());event.stop();}
else if(code==90||code==8){select.scrollToNode(this.history.undo());event.stop();}
else if(code==83&&this.options.saveFunction){this.options.saveFunction();event.stop();}}},keyPress:function(event){var electric=/indent|default/.test(this.options.tabMode)&&Editor.Parser.electricChars;if((this.frozen&&(!this.keyFilter||this.keyFilter(event.keyCode)))||event.code==13||(event.code==9&&this.options.tabMode!="default")||(event.keyCode==32&&event.shiftKey&&this.options.tabMode=="default"))
event.stop();else if(electric&&electric.indexOf(event.character)!=-1)
this.parent.setTimeout(method(this,"indentAtCursor"),0);},keyUp:function(event){this.cursorActivity(isSafeKey(event.keyCode));},indentLineAfter:function(start,direction){var whiteSpace=start?start.nextSibling:this.container.firstChild;if(whiteSpace&&!hasClass(whiteSpace,"whitespace"))
whiteSpace=null;var firstText=whiteSpace?whiteSpace.nextSibling:(start?start.nextSibling:this.container.firstChild);var nextChars=(start&&firstText&&firstText.currentText)?firstText.currentText:"";var newIndent=0,curIndent=whiteSpace?whiteSpace.currentText.length:0;if(direction!=null&&this.options.tabMode=="shift")
newIndent=direction?curIndent+indentUnit:Math.max(0,curIndent-indentUnit)
else if(start)
newIndent=start.indentation(nextChars,curIndent,direction);else if(Editor.Parser.firstIndentation)
newIndent=Editor.Parser.firstIndentation(nextChars,curIndent,direction);var indentDiff=newIndent-curIndent;if(indentDiff<0){if(newIndent==0){if(firstText)select.snapshotMove(whiteSpace.firstChild,firstText.firstChild,0);removeElement(whiteSpace);whiteSpace=null;}
else{select.snapshotMove(whiteSpace.firstChild,whiteSpace.firstChild,indentDiff,true);whiteSpace.currentText=makeWhiteSpace(newIndent);whiteSpace.firstChild.nodeValue=whiteSpace.currentText;}}
else if(indentDiff>0){if(whiteSpace){whiteSpace.currentText=makeWhiteSpace(newIndent);whiteSpace.firstChild.nodeValue=whiteSpace.currentText;}
else{whiteSpace=makePartSpan(makeWhiteSpace(newIndent),this.doc);whiteSpace.className="whitespace";if(start)insertAfter(whiteSpace,start);else this.container.insertBefore(whiteSpace,this.container.firstChild);}
if(firstText)select.snapshotMove(firstText.firstChild,whiteSpace.firstChild,curIndent,false,true);}
if(indentDiff!=0)this.addDirtyNode(start);return whiteSpace;},highlightAtCursor:function(){var pos=select.selectionTopNode(this.container,true);var to=select.selectionTopNode(this.container,false);if(pos===false||to===false)return;select.markSelection(this.win);if(this.highlight(pos,endOfLine(to,this.container),true,20)===false)
return false;select.selectMarked();return true;},handleTab:function(direction){if(this.options.tabMode=="spaces")
select.insertTabAtCursor(this.win);else
this.reindentSelection(direction);},home:function(){var cur=select.selectionTopNode(this.container,true),start=cur;if(cur===false||!(!cur||cur.isPart||cur.nodeName=="BR")||!this.container.firstChild)
return false;while(cur&&cur.nodeName!="BR")cur=cur.previousSibling;var next=cur?cur.nextSibling:this.container.firstChild;if(next&&next!=start&&next.isPart&&hasClass(next,"whitespace"))
select.focusAfterNode(next,this.container);else
select.focusAfterNode(cur,this.container);return true;},scheduleParenBlink:function(){if(this.parenEvent)this.parent.clearTimeout(this.parenEvent);var self=this;this.parenEvent=this.parent.setTimeout(function(){self.blinkParens();},300);},blinkParens:function(jump){if(!window.select)return;if(this.parenEvent)this.parent.clearTimeout(this.parenEvent);this.parenEvent=null;function paren(node){if(node.currentText){var match=node.currentText.match(/^[\s\u00a0]*([\(\)\[\]{}])[\s\u00a0]*$/);return match&&match[1];}}
function forward(ch){return/[\(\[\{]/.test(ch);}
var ch,self=this,cursor=select.selectionTopNode(this.container,true);if(!cursor||!this.highlightAtCursor())return;cursor=select.selectionTopNode(this.container,true);if(!(cursor&&((ch=paren(cursor))||(cursor=cursor.nextSibling)&&(ch=paren(cursor)))))
return;var className=cursor.className,dir=forward(ch),match=matching[ch];function tryFindMatch(){var stack=[],ch,ok=true;;for(var runner=cursor;runner;runner=dir?runner.nextSibling:runner.previousSibling){if(runner.className==className&&runner.nodeName=="SPAN"&&(ch=paren(runner))){if(forward(ch)==dir)
stack.push(ch);else if(!stack.length)
ok=false;else if(stack.pop()!=matching[ch])
ok=false;if(!stack.length)break;}
else if(runner.dirty||runner.nodeName!="SPAN"&&runner.nodeName!="BR"){return{node:runner,status:"dirty"};}}
return{node:runner,status:runner&&ok};}
function blink(node,ok){node.style.fontWeight="bold";node.style.color=ok?"#8F8":"#F88";self.parent.setTimeout(function(){node.style.fontWeight="";node.style.color="";},500);}
while(true){var found=tryFindMatch();if(found.status=="dirty"){this.highlight(found.node,endOfLine(found.node));found.node.dirty=false;continue;}
else{blink(cursor,found.status);if(found.node){blink(found.node,found.status);if(jump)select.focusAfterNode(found.node.previousSibling,this.container);}
break;}}},indentAtCursor:function(direction){if(!this.container.firstChild)return;if(!this.highlightAtCursor())return;var cursor=select.selectionTopNode(this.container,false);if(cursor===false)
return;var lineStart=startOfLine(cursor);var whiteSpace=this.indentLineAfter(lineStart,direction);if(cursor==lineStart&&whiteSpace)
cursor=whiteSpace;if(cursor==whiteSpace)
select.focusAfterNode(cursor,this.container);},indentRegion:function(start,end,direction){var current=(start=startOfLine(start)),before=start&&startOfLine(start.previousSibling);if(end.nodeName!="BR")end=endOfLine(end,this.container);do{var next=endOfLine(current,this.container);if(current)this.highlight(before,next,true);this.indentLineAfter(current,direction);before=current;current=next;}while(current!=end);select.setCursorPos(this.container,{node:start,offset:0},{node:end,offset:0});},cursorActivity:function(safe){if(internetExplorer){this.container.createTextRange().execCommand("unlink");this.selectionSnapshot=select.selectionCoords(this.win);}
var activity=this.options.cursorActivity;if(!safe||activity){var cursor=select.selectionTopNode(this.container,false);if(cursor===false||!this.container.firstChild)return;cursor=cursor||this.container.firstChild;if(activity)activity(cursor);if(!safe){this.scheduleHighlight();this.addDirtyNode(cursor);}}},reparseBuffer:function(){forEach(this.container.childNodes,function(node){node.dirty=true;});if(this.container.firstChild)
this.addDirtyNode(this.container.firstChild);},addDirtyNode:function(node){node=node||this.container.firstChild;if(!node)return;for(var i=0;i<this.dirty.length;i++)
if(this.dirty[i]==node)return;if(node.nodeType!=3)
node.dirty=true;this.dirty.push(node);},scheduleHighlight:function(){var self=this;this.parent.clearTimeout(this.highlightTimeout);this.highlightTimeout=this.parent.setTimeout(function(){self.highlightDirty();},this.options.passDelay);},getDirtyNode:function(){while(this.dirty.length>0){var found=this.dirty.pop();try{while(found&&found.parentNode!=this.container)
found=found.parentNode
if(found&&(found.dirty||found.nodeType==3))
return found;}catch(e){}}
return null;},highlightDirty:function(force){if(!window.select)return;if(!this.options.readOnly)select.markSelection(this.win);var start,endTime=force?null:time()+this.options.passTime;while(time()<endTime&&(start=this.getDirtyNode())){var result=this.highlight(start,endTime);if(result&&result.node&&result.dirty)
this.addDirtyNode(result.node);}
if(!this.options.readOnly)select.selectMarked();if(start)this.scheduleHighlight();return this.dirty.length==0;},documentScanner:function(passTime){var self=this,pos=null;return function(){if(!window.select)return;if(pos&&pos.parentNode!=self.container)
pos=null;select.markSelection(self.win);var result=self.highlight(pos,time()+passTime,true);select.selectMarked();var newPos=result?(result.node&&result.node.nextSibling):null;pos=(pos==newPos)?null:newPos;self.delayScanning();};},delayScanning:function(){if(this.scanner){this.parent.clearTimeout(this.documentScan);this.documentScan=this.parent.setTimeout(this.scanner,this.options.continuousScanning);}},highlight:function(from,target,cleanLines,maxBacktrack){var container=this.container,self=this,active=this.options.activeTokens;var endTime=(typeof target=="number"?target:null);if(!container.firstChild)
return;while(from&&(!from.parserFromHere||from.dirty)){if(maxBacktrack!=null&&from.nodeName=="BR"&&(--maxBacktrack)<0)
return false;from=from.previousSibling;}
if(from&&!from.nextSibling)
return;function correctPart(token,part){return!part.reduced&&part.currentText==token.value&&part.className==token.style;}
function shortenPart(part,minus){part.currentText=part.currentText.substring(minus);part.reduced=true;}
function tokenPart(token){var part=makePartSpan(token.value,self.doc);part.className=token.style;return part;}
function maybeTouch(node){if(node){if(lineDirty||node.nextSibling!=node.oldNextSibling)
self.history.touch(node);node.oldNextSibling=node.nextSibling;}
else{if(lineDirty||self.container.firstChild!=self.container.oldFirstChild)
self.history.touch(node);self.container.oldFirstChild=self.container.firstChild;}}
var traversal=traverseDOM(from?from.nextSibling:container.firstChild),stream=stringStream(traversal),parsed=from?from.parserFromHere(stream):Editor.Parser.make(stream);var parts={current:null,get:function(){if(!this.current)
this.current=traversal.nodes.shift();return this.current;},next:function(){this.current=null;},remove:function(){container.removeChild(this.get());this.current=null;},getNonEmpty:function(){var part=this.get();while(part&&part.nodeName=="SPAN"&&part.currentText==""){var old=part;this.remove();part=this.get();select.snapshotMove(old.firstChild,part&&(part.firstChild||part),0);}
return part;}};var lineDirty=false,prevLineDirty=true,lineNodes=0;forEach(parsed,function(token){var part=parts.getNonEmpty();if(token.value=="\n"){if(part.nodeName!="BR")
throw"Parser out of sync. Expected BR.";if(part.dirty||!part.indentation)lineDirty=true;maybeTouch(from);from=part;part.parserFromHere=parsed.copy();part.indentation=token.indentation;part.dirty=false;if(endTime==null&&part==target)throw StopIteration;if((endTime!=null&&time()>=endTime)||(!lineDirty&&!prevLineDirty&&lineNodes>1&&!cleanLines))
throw StopIteration;prevLineDirty=lineDirty;lineDirty=false;lineNodes=0;parts.next();}
else{if(part.nodeName!="SPAN")
throw"Parser out of sync. Expected SPAN.";if(part.dirty)
lineDirty=true;lineNodes++;if(correctPart(token,part)){part.dirty=false;parts.next();}
else{lineDirty=true;var newPart=tokenPart(token);container.insertBefore(newPart,part);if(active)active(newPart,token,self);var tokensize=token.value.length;var offset=0;while(tokensize>0){part=parts.get();var partsize=part.currentText.length;select.snapshotReplaceNode(part.firstChild,newPart.firstChild,tokensize,offset);if(partsize>tokensize){shortenPart(part,tokensize);tokensize=0;}
else{tokensize-=partsize;offset+=partsize;parts.remove();}}}}});maybeTouch(from);webkitLastLineHack(this.container);return{node:parts.getNonEmpty(),dirty:lineDirty};}};return Editor;})();addEventHandler(window,"load",function(){var CodeMirror=window.frameElement.CodeMirror;CodeMirror.editor=new Editor(CodeMirror.options);this.parent.setTimeout(method(CodeMirror,"init"),0);});function tokenizer(source,state){function isWhiteSpace(ch){return ch!="\n"&&/^[\s\u00a0]*$/.test(ch);}
var tokenizer={state:state,take:function(type){if(typeof(type)=="string")
type={style:type,type:type};type.content=(type.content||"")+source.get();if(!/\n$/.test(type.content))
source.nextWhile(isWhiteSpace);type.value=type.content+source.get();return type;},next:function(){if(!source.more())throw StopIteration;var type;if(source.equals("\n")){source.next();return this.take("whitespace");}
if(source.applies(isWhiteSpace))
type="whitespace";else
while(!type)
type=this.state(source,function(s){tokenizer.state=s;});return this.take(type);}};return tokenizer;}
var tokenizeJavaScript=(function(){function nextUntilUnescaped(source,end){var escaped=false;var next;while(!source.endOfLine()){var next=source.next();if(next==end&&!escaped)
return false;escaped=!escaped&&next=="\\";}
return escaped;}
var keywords=function(){function result(type,style){return{type:type,style:"js-"+style};}
var keywordA=result("keyword a","keyword");var keywordB=result("keyword b","keyword");var keywordC=result("keyword c","keyword");var operator=result("operator","keyword");var atom=result("atom","atom");return{"if":keywordA,"while":keywordA,"with":keywordA,"else":keywordB,"do":keywordB,"try":keywordB,"finally":keywordB,"return":keywordC,"break":keywordC,"continue":keywordC,"new":keywordC,"delete":keywordC,"throw":keywordC,"in":operator,"typeof":operator,"instanceof":operator,"var":result("var","keyword"),"function":result("function","keyword"),"catch":result("catch","keyword"),"for":result("for","keyword"),"switch":result("switch","keyword"),"case":result("case","keyword"),"default":result("default","keyword"),"true":atom,"false":atom,"null":atom,"undefined":atom,"NaN":atom,"Infinity":atom};}();var isOperatorChar=/[+\-*&%\/=<>!?|]/;var isHexDigit=/[0-9A-Fa-f]/;var isWordChar=/[\w\$_]/;function jsTokenState(inside,regexp){return function(source,setState){var newInside=inside;var type=jsToken(inside,regexp,source,function(c){newInside=c;});var newRegexp=type.type=="operator"||type.type=="keyword c"||type.type.match(/^[\[{}\(,;:]$/);if(newRegexp!=regexp||newInside!=inside)
setState(jsTokenState(newInside,newRegexp));return type;};}
function jsToken(inside,regexp,source,setInside){function readHexNumber(){source.next();source.nextWhileMatches(isHexDigit);return{type:"number",style:"js-atom"};}
function readNumber(){source.nextWhileMatches(/[0-9]/);if(source.equals(".")){source.next();source.nextWhileMatches(/[0-9]/);}
if(source.equals("e")||source.equals("E")){source.next();if(source.equals("-"))
source.next();source.nextWhileMatches(/[0-9]/);}
return{type:"number",style:"js-atom"};}
function readWord(){source.nextWhileMatches(isWordChar);var word=source.get();var known=keywords.hasOwnProperty(word)&&keywords.propertyIsEnumerable(word)&&keywords[word];return known?{type:known.type,style:known.style,content:word}:{type:"variable",style:"js-variable",content:word};}
function readRegexp(){nextUntilUnescaped(source,"/");source.nextWhileMatches(/[gi]/);return{type:"regexp",style:"js-string"};}
function readMultilineComment(start){var newInside="/*";var maybeEnd=(start=="*");while(true){if(source.endOfLine())
break;var next=source.next();if(next=="/"&&maybeEnd){newInside=null;break;}
maybeEnd=(next=="*");}
setInside(newInside);return{type:"comment",style:"js-comment"};}
function readOperator(){source.nextWhileMatches(isOperatorChar);return{type:"operator",style:"js-operator"};}
function readString(quote){var endBackSlash=nextUntilUnescaped(source,quote);setInside(endBackSlash?quote:null);return{type:"string",style:"js-string"};}
if(inside=="\""||inside=="'")
return readString(inside);var ch=source.next();if(inside=="/*")
return readMultilineComment(ch);else if(ch=="\""||ch=="'")
return readString(ch);else if(/[\[\]{}\(\),;\:\.]/.test(ch))
return{type:ch,style:"js-punctuation"};else if(ch=="0"&&(source.equals("x")||source.equals("X")))
return readHexNumber();else if(/[0-9]/.test(ch))
return readNumber();else if(ch=="/"){if(source.equals("*"))
{source.next();return readMultilineComment(ch);}
else if(source.equals("/"))
{nextUntilUnescaped(source,null);return{type:"comment",style:"js-comment"};}
else if(regexp)
return readRegexp();else
return readOperator();}
else if(isOperatorChar.test(ch))
return readOperator();else
return readWord();}
return function(source,startState){return tokenizer(source,startState||jsTokenState(false,true));};})();var tokenizeJavaScript=(function(){function nextUntilUnescaped(source,end){var escaped=false;var next;while(!source.endOfLine()){var next=source.next();if(next==end&&!escaped)
return false;escaped=!escaped&&next=="\\";}
return escaped;}
var keywords=function(){function result(type,style){return{type:type,style:"js-"+style};}
var keywordA=result("keyword a","keyword");var keywordB=result("keyword b","keyword");var keywordC=result("keyword c","keyword");var operator=result("operator","keyword");var atom=result("atom","atom");return{"if":keywordA,"while":keywordA,"with":keywordA,"else":keywordB,"do":keywordB,"try":keywordB,"finally":keywordB,"return":keywordC,"break":keywordC,"continue":keywordC,"new":keywordC,"delete":keywordC,"throw":keywordC,"in":operator,"typeof":operator,"instanceof":operator,"var":result("var","keyword"),"function":result("function","keyword"),"catch":result("catch","keyword"),"for":result("for","keyword"),"switch":result("switch","keyword"),"case":result("case","keyword"),"default":result("default","keyword"),"true":atom,"false":atom,"null":atom,"undefined":atom,"NaN":atom,"Infinity":atom};}();var isOperatorChar=/[+\-*&%\/=<>!?|]/;var isHexDigit=/[0-9A-Fa-f]/;var isWordChar=/[\w\$_]/;function jsTokenState(inside,regexp){return function(source,setState){var newInside=inside;var type=jsToken(inside,regexp,source,function(c){newInside=c;});var newRegexp=type.type=="operator"||type.type=="keyword c"||type.type.match(/^[\[{}\(,;:]$/);if(newRegexp!=regexp||newInside!=inside)
setState(jsTokenState(newInside,newRegexp));return type;};}
function jsToken(inside,regexp,source,setInside){function readHexNumber(){source.next();source.nextWhileMatches(isHexDigit);return{type:"number",style:"js-atom"};}
function readNumber(){source.nextWhileMatches(/[0-9]/);if(source.equals(".")){source.next();source.nextWhileMatches(/[0-9]/);}
if(source.equals("e")||source.equals("E")){source.next();if(source.equals("-"))
source.next();source.nextWhileMatches(/[0-9]/);}
return{type:"number",style:"js-atom"};}
function readWord(){source.nextWhileMatches(isWordChar);var word=source.get();var known=keywords.hasOwnProperty(word)&&keywords.propertyIsEnumerable(word)&&keywords[word];return known?{type:known.type,style:known.style,content:word}:{type:"variable",style:"js-variable",content:word};}
function readRegexp(){nextUntilUnescaped(source,"/");source.nextWhileMatches(/[gi]/);return{type:"regexp",style:"js-string"};}
function readMultilineComment(start){var newInside="/*";var maybeEnd=(start=="*");while(true){if(source.endOfLine())
break;var next=source.next();if(next=="/"&&maybeEnd){newInside=null;break;}
maybeEnd=(next=="*");}
setInside(newInside);return{type:"comment",style:"js-comment"};}
function readOperator(){source.nextWhileMatches(isOperatorChar);return{type:"operator",style:"js-operator"};}
function readString(quote){var endBackSlash=nextUntilUnescaped(source,quote);setInside(endBackSlash?quote:null);return{type:"string",style:"js-string"};}
if(inside=="\""||inside=="'")
return readString(inside);var ch=source.next();if(inside=="/*")
return readMultilineComment(ch);else if(ch=="\""||ch=="'")
return readString(ch);else if(/[\[\]{}\(\),;\:\.]/.test(ch))
return{type:ch,style:"js-punctuation"};else if(ch=="0"&&(source.equals("x")||source.equals("X")))
return readHexNumber();else if(/[0-9]/.test(ch))
return readNumber();else if(ch=="/"){if(source.equals("*"))
{source.next();return readMultilineComment(ch);}
else if(source.equals("/"))
{nextUntilUnescaped(source,null);return{type:"comment",style:"js-comment"};}
else if(regexp)
return readRegexp();else
return readOperator();}
else if(isOperatorChar.test(ch))
return readOperator();else
return readWord();}
return function(source,startState){return tokenizer(source,startState||jsTokenState(false,true));};})();var JSParser=Editor.Parser=(function(){var atomicTypes={"atom":true,"number":true,"variable":true,"string":true,"regexp":true};function JSLexical(indented,column,type,align,prev,info){this.indented=indented;this.column=column;this.type=type;if(align!=null)
this.align=align;this.prev=prev;this.info=info;}
function indentJS(lexical){return function(firstChars){var firstChar=firstChars&&firstChars.charAt(0),type=lexical.type;var closing=firstChar==type;if(type=="vardef")
return lexical.indented+4;else if(type=="form"&&firstChar=="{")
return lexical.indented;else if(type=="stat"||type=="form")
return lexical.indented+indentUnit;else if(lexical.info=="switch"&&!closing)
return lexical.indented+(/^(?:case|default)\b/.test(firstChars)?indentUnit:2*indentUnit);else if(lexical.align)
return lexical.column-(closing?1:0);else
return lexical.indented+(closing?0:indentUnit);};}
function parseJS(input,basecolumn){var tokens=tokenizeJavaScript(input);var cc=[statements];var context=null;var lexical=new JSLexical((basecolumn||0)-indentUnit,0,"block",false);var column=0;var indented=0;var consume,marked;var parser={next:next,copy:copy};function next(){while(cc[cc.length-1].lex)
cc.pop()();var token=tokens.next();if(token.type=="whitespace"&&column==0)
indented=token.value.length;column+=token.value.length;if(token.content=="\n"){indented=column=0;if(!("align"in lexical))
lexical.align=false;token.indentation=indentJS(lexical);}
if(token.type=="whitespace"||token.type=="comment")
return token;if(!("align"in lexical))
lexical.align=true;while(true){consume=marked=false;cc.pop()(token.type,token.content);if(consume){if(marked)
token.style=marked;else if(token.type=="variable"&&inScope(token.content))
token.style="js-localvariable";return token;}}}
function copy(){var _context=context,_lexical=lexical,_cc=cc.concat([]),_tokenState=tokens.state;return function copyParser(input){context=_context;lexical=_lexical;cc=_cc.concat([]);column=indented=0;tokens=tokenizeJavaScript(input,_tokenState);return parser;};}
function push(fs){for(var i=fs.length-1;i>=0;i--)
cc.push(fs[i]);}
function cont(){push(arguments);consume=true;}
function pass(){push(arguments);consume=false;}
function mark(style){marked=style;}
function pushcontext(){context={prev:context,vars:{"this":true,"arguments":true}};}
function popcontext(){context=context.prev;}
function register(varname){if(context){mark("js-variabledef");context.vars[varname]=true;}}
function inScope(varname){var cursor=context;while(cursor){if(cursor.vars[varname])
return true;cursor=cursor.prev;}
return false;}
function pushlex(type,info){var result=function(){lexical=new JSLexical(indented,column,type,null,lexical,info)};result.lex=true;return result;}
function poplex(){lexical=lexical.prev;}
poplex.lex=true;function expect(wanted){return function expecting(type){if(type==wanted)cont();else cont(arguments.callee);};}
function statements(type){return pass(statement,statements);}
function statement(type){if(type=="var")cont(pushlex("vardef"),vardef1,expect(";"),poplex);else if(type=="keyword a")cont(pushlex("form"),expression,statement,poplex);else if(type=="keyword b")cont(pushlex("form"),statement,poplex);else if(type=="{")cont(pushlex("}"),block,poplex);else if(type=="function")cont(functiondef);else if(type=="for")cont(pushlex("form"),expect("("),pushlex(")"),forspec1,expect(")"),poplex,statement,poplex);else if(type=="variable")cont(pushlex("stat"),maybelabel);else if(type=="switch")cont(pushlex("form"),expression,pushlex("}","switch"),expect("{"),block,poplex,poplex);else if(type=="case")cont(expression,expect(":"));else if(type=="default")cont(expect(":"));else if(type=="catch")cont(pushlex("form"),pushcontext,expect("("),funarg,expect(")"),statement,poplex,popcontext);else pass(pushlex("stat"),expression,expect(";"),poplex);}
function expression(type){if(atomicTypes.hasOwnProperty(type))cont(maybeoperator);else if(type=="function")cont(functiondef);else if(type=="keyword c")cont(expression);else if(type=="(")cont(pushlex(")"),expression,expect(")"),poplex,maybeoperator);else if(type=="operator")cont(expression);else if(type=="[")cont(pushlex("]"),commasep(expression,"]"),poplex,maybeoperator);else if(type=="{")cont(pushlex("}"),commasep(objprop,"}"),poplex,maybeoperator);}
function maybeoperator(type){if(type=="operator")cont(expression);else if(type=="(")cont(pushlex(")"),expression,commasep(expression,")"),poplex,maybeoperator);else if(type==".")cont(property,maybeoperator);else if(type=="[")cont(pushlex("]"),expression,expect("]"),poplex,maybeoperator);}
function maybelabel(type){if(type==":")cont(poplex,statement);else pass(maybeoperator,expect(";"),poplex);}
function property(type){if(type=="variable"){mark("js-property");cont();}}
function objprop(type){if(type=="variable")mark("js-property");if(atomicTypes.hasOwnProperty(type))cont(expect(":"),expression);}
function commasep(what,end){function proceed(type){if(type==",")cont(what,proceed);else if(type==end)cont();else cont(expect(end));};return function commaSeparated(type){if(type==end)cont();else pass(what,proceed);};}
function block(type){if(type=="}")cont();else pass(statement,block);}
function vardef1(type,value){if(type=="variable"){register(value);cont(vardef2);}
else cont();}
function vardef2(type,value){if(value=="=")cont(expression,vardef2);else if(type==",")cont(vardef1);}
function forspec1(type){if(type=="var")cont(vardef1,forspec2);else if(type==";")pass(forspec2);else if(type=="variable")cont(formaybein);else pass(forspec2);}
function formaybein(type,value){if(value=="in")cont(expression);else cont(maybeoperator,forspec2);}
function forspec2(type,value){if(type==";")cont(forspec3);else if(value=="in")cont(expression);else cont(expression,expect(";"),forspec3);}
function forspec3(type){if(type==")")pass();else cont(expression);}
function functiondef(type,value){if(type=="variable"){register(value);cont(functiondef);}
else if(type=="(")cont(pushcontext,commasep(funarg,")"),statement,popcontext);}
function funarg(type,value){if(type=="variable"){register(value);cont();}}
return parser;}
return{make:parseJS,electricChars:"{}:"};})();