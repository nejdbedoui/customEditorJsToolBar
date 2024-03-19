import React, { createContext, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Checklist from '@editorjs/checklist'
import RawTool from '@editorjs/raw';
import './css.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './toolBarcss.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStrikethrough,faBold,faItalic,faUnderline } from '@fortawesome/free-solid-svg-icons';
import SketchExample from './SketchExample';
import Underline from '@editorjs/underline';
import Strikethrough from 'editorjs-strikethrough';
export const EditorContext=createContext()
let blockid=null;
let blockElement=null;
let data=null;
let selectedText = null;
let startPosition = null;
let endPosition = null;
 function Editor(props)  {
    const editorInstanceRef= useRef(null)
    const initEditor= ()=>{
        const editor =  new EditorJS({
            holder:"editorjs",
            placeholder:"Let's take a note!",
            tools: {
              strikethrough: {
                class: Strikethrough,
                shortcut: 'CMD+SHIFT+X',
              },
              underline: Underline,
                header: {
                class: Header,
                config: {
                  placeholder: 'Enter a header',
                  levels: [1,2, 3, 4],
                  defaultLevel: 1,
                  shortcut: 'CMD+SHIFT+H',
                }
              },
              raw: {
                class: RawTool,
                inlineToolbar: false,
              },
              checklist: {
                class: Checklist,
                inlineToolbar: false,
              }
            },
              onChange: async () => {
                data = await editor.save();
              }
              
        })
        editorInstanceRef.current = editor    
        const editorContainer = document.getElementById('editorjs');
        editorContainer.addEventListener('click', handleBlockClick);
        editorContainer.addEventListener('mouseup', selectionevent);
    }


/**
 * Handles the user selection event within an editor block.
 * This function determines the closest block element based on the event target,
 * retrieves the selected text and its start and end positions within the block,
 * and gets the index of the current block in the editor.
 * 
 * @param {Event} event - The event object triggered by the user action.
 */

    const selectionevent = async (event) => {
      const closestBlock = event.target.closest('.ce-block');
      let blockElement, blockId;
      if (closestBlock) {
        blockElement = closestBlock;
        blockId = blockElement.getAttribute('data-id');
      } else {
        blockElement = null;
        blockId = null;
      }
      const selection = window.getSelection();
      selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(blockElement);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
       startPosition = preSelectionRange.toString().length;
    
      // Adjust endPosition by excluding the length of the selectedText itself
       endPosition = startPosition + selectedText.length;
       index=editorInstanceRef.current.blocks.getCurrentBlockIndex();
     
    };




////// when block is clicked ////////
const handleBlockClick = async (event) => {
  const closestBlock = event.target.closest('.ce-block');
  if (closestBlock) {
    blockElement = closestBlock;
    blockid = blockElement.getAttribute('data-id');
  } else {
    blockElement = null;
    blockid = null;
  }
};
////// end of when block is clicked ////////





/////////////////////// add bold italic underline or color to selected text /////////////////////////


/**
 * Changes the color of a font element in the HTML content.
 * This function takes a color value as input and generates opening and closing tags
 * for a font element with the specified color style. It then calls the changeStyle function
 * to apply the color change to the HTML content.
 * 
 * @param {string} data - The color value to apply (e.g., "red", "#00ff00", "rgb(255, 0, 0)").
 */
const changeColor = (data) => {
  const word="font"
  const open=`<font style="color: ${data};">`
  const close='</font>'
  changeStyle(word,open,close);
};
 

/**
 * Removes empty HTML tags from the given text content.
 * This function parses the HTML text using DOMParser, removes all empty tags,
 * and returns the cleaned HTML text without empty tags.
 * 
 * @param {string} text - The HTML text content to clean.
 * @returns {string} - The cleaned HTML text without empty tags.
 */
const cleanHTMLTags = (text) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const emptyTags = doc.querySelectorAll(':empty');
  emptyTags.forEach((tag) => tag.parentNode.removeChild(tag));
  const cleanedText = doc.body.innerHTML;
  return cleanedText;
};



/**
 * Adds style tags (bold italic underline and strike) around the selected text in the block content
 *  using the changestyle function.
 */
    const addstyle = (word) => {
      const startTime = performance.now();
      const open = `<${word}>`;
      const close = `</${word}>`;
      changeStyle(word, open, close);
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      console.log('Elapsed time:', elapsedTime, 'milliseconds');
  }

/**
 * This function is responsible for modifying the styling of the selected text within the block content.
 * It considers multiple cases, taking bold styling as an example.
 * The process starts by splitting the text and iterating through the full HTML text to determine the left, middle, and right portions.
 * Then, it performs checks on the left, right, and middle to determine which case we are in.
 *
 * There are 5 cases, for example, when the bold button is pressed:
 * 1. If the text is "123456789" and "2345678" is selected, we are in the last case, which is simple addition.
 * 2. If the text is "1<b>2345678</b>9" and "2345678" is selected, we are in case 3, which is removing the `<b></b>` tags.
 * 3. If the text is "1<b>2345678</b>9" and "45678" is selected, we are in case 3, which is changing the position of the `</b>` tag.
 * 4. If the text is "1<b>2345678</b>9" and "23456" is selected, we are in case 4, which is changing the position of the `<b>` tag.
 * 5. If the text is "1<b>2345678</b>9" and "45" is selected, we are in case 4, which involves adding `</b>` before "45" and adding `<b>` after.
 *
 * These are the common cases, but sometimes other cases like case 1 and 2 occur.
 * Note that all cases except adding are not applied to the `<font>` tag.
 */

const changeStyle = async (word, open, close) => {
  let left = '';
  let midle = '';
  let right = '';
  let leftResult;
  let midleResult;
  let rightResult;

  // Start and end positions for text modification
  let a = startPosition;
  let b = endPosition;
  
  // Ensure a <= b because when i select a text from right to left they switch 
  if (a > b) {
    a = startPosition;
    b = startPosition;
  }

  // Check if blockid is provided and fetch updated data
  if (blockid) {
    const updatedData = data;
    const currentBlock = updatedData.blocks.find((block) => block.id === blockid);
    
    // If the current block is found
    if (currentBlock) {
      let currentText = currentBlock.data.text;
      
       /**  Split the full html text with the tags into an array for processing 
       *     exemple text:"123456789" html text: "123<b>456</b>789"
       */
      const textArray = currentText.split('');
      let skipMode = false;

      // Iterate through the full html text to determine left, middle, and right portions 
      for (let i = 0; i < textArray.length && i < b; i++) {
          if (i === b) {
              break;
          }
          
          if (textArray[i] === '<') {
              skipMode = true;
          }
          
          if (skipMode && i <= a) {
              a++;
              b++;
          }
          
          if (skipMode && i > a) {
              b++;
          }
          
          if (textArray[i] === '>') {
              skipMode = false;
          }
      }

      // Extract left, middle, and right portions of the text
      left = currentText.substring(0, a)
      midle = currentText.substring(a, b)
      right = currentText.substring(b)

      // Perform checks and modifications based on the left, middle, and right portions
      leftResult = checkLeft(left, word)
      midleResult = countAndSubtractTags(midle, word)
      rightResult = checkright(right, word)

      // Construct modifiedText based on the checks and results
      if (leftResult.check && rightResult.check && word !== "font") {
        console.log("case 1")
        const modifiedText = [
          leftResult.text,
          midleResult.text,
          rightResult.text
        ].join('');
        currentBlock.data.text = cleanHTMLTags(modifiedText);
      } else if (leftResult.check && !rightResult.check && word !== "font") {
        console.log("case 2")
        const modifiedText = [
          leftResult.text,
          midleResult.text,
          rightResult.storedOpenTags,
          rightResult.text
        ].join('');
        currentBlock.data.text = cleanHTMLTags(modifiedText);
      } else if (!leftResult.check && rightResult.check && word !== "font") {
        console.log("case 3")
        const modifiedText = [
          leftResult.text,
          rightResult.CloseTag,
          midleResult.text,
          rightResult.text
        ].join('');
        currentBlock.data.text = cleanHTMLTags(modifiedText);
      } else if (!leftResult.check && !rightResult.check && leftResult.CloseTag && rightResult.storedOpenTags && word !== "font") {
        console.log("case 4")
        if (word === "font") {
          midleResult.text = open + midleResult.text + close;
        }
        const modifiedText = [
          leftResult.text,
          leftResult.CloseTag,
          midleResult.text,
          rightResult.storedOpenTags,
          rightResult.text
        ].join('');
        currentBlock.data.text = cleanHTMLTags(modifiedText);
      } else {
        console.log("case adding")
        const modifiedText = [
          currentText.substring(0, a),
          midleResult.storedCloseTags,
          open,
          midleResult.text,
          close,
          midleResult.storedOpenTags,
          currentText.substring(b)
        ].join('');
        currentBlock.data.text = cleanHTMLTags(modifiedText);
      }
    }

    // Render the updated data in the editor
    editorInstanceRef.current.render(updatedData);
  }
}

/**
 * Analyzes the left part of a text string in HTML content for a specified word.
 * This function looks for the last occurrence of the opening tag and the corresponding
 * closing tag related to the specified word in the text. It handles tags and modifies
 * the text accordingly, providing information about found tags and any modifications made.
 * 
 * @param {string} text - The input text string to be analyzed.
 * @param {string} word - The specified word that the function focuses on in the text.
 * @returns {Object} An object containing storedOpenTags, CloseTag, modified text, and check flag.
 * - storedOpenTags: Any opening tags related to the specified word found in the text.
 * - CloseTag: The closing tag related to the specified word.
 * - text: The modified text after tag processing.
 * - check: A flag indicating whether modifications were made to the text (true/false).
 */
function checkLeft(text, word) {
  let storedOpenTags = '';
  let CloseTag = '';
  let check = false;

  // Check if the input text is not empty
  if (text !== '') {
    let startIndex = text.length - 1;
    let endIndex = text.length;

    // Iterate backwards through the text to find the last occurrence of the opening tag of the word
    while ((startIndex = text.lastIndexOf('<' + word[0], startIndex)) !== -1) {
      // Find the corresponding closing tag for the word
      endIndex = text.indexOf(word[word.length - 1] + '>', startIndex);

      // If no closing tag is found, break the loop
      if (endIndex === -1) {
        break;
      }

      // Extract the tag from startIndex to endIndex
      const tag = text.substring(startIndex, endIndex + 1);

      // Check if the tag is a closing tag for the word
      if (tag.startsWith('</' + word)) {
        // If it's a closing tag, break the loop
        break;
      } else if (tag.startsWith('<' + word)) {
        // If it's an opening tag, store it as the storedOpenTags
        storedOpenTags = text.substring(startIndex, endIndex + 1);

        // Check if the opening tag is at the end of the text
        if (endIndex + 1 === text.length) {
          // If yes, remove the tag from the text and set check to true
          text = text.substring(0, startIndex);
          check = true;
          break;
        } else {
          // If not, set the CloseTag and break the loop
          CloseTag = '</' + word + '>';
          break;
        }
      }
      // Move to the previous character in the text
      startIndex--;
    }
  }

  // Return an object containing the storedOpenTags, CloseTag, modified text, and check flag
  return { storedOpenTags, CloseTag, text, check };
}


/**
 * Analyzes the right part of a text string in HTML content for a specified word.
 * This function looks for opening and closing tags related to the specified word
 * in the right part of the text. It handles tags and modifies the text accordingly,
 * providing information about found tags and any modifications made.
 * 
 * @param {string} text - The input text string to be analyzed.
 * @param {string} word - The specified word that the function focuses on in the text.
 * @returns {Object} An object containing storedOpenTags, CloseTag, modified text, and check flag.
 * - storedOpenTags: Any opening tags related to the specified word found in the text.
 * - CloseTag: The closing tag related to the specified word.
 * - text: The modified text after tag processing.
 * - check: A flag indicating whether modifications were made to the text (true/false).
 */
function checkright(text, word) {
  // Initialize variables to store open tags, closing tags, and a check flag
  let storedOpenTags = '';
  let CloseTag = '';
  let startIndex = 0;
  let endIndex = 0;
  let check = false;

  // Iterate through the text to find opening and closing tags related to the specified word
  while ((startIndex = text.indexOf('<', endIndex)) !== -1 && endIndex != text.length) {
    // Find the index of the closing '>' character
    endIndex = text.indexOf('>', startIndex);

    // If no closing tag is found, break the loop
    if (endIndex === -1) {
      break;
    }

    // Extract the tag from startIndex to endIndex
    const tag = text.substring(startIndex, endIndex + 1);

    // Check if the tag is a closing tag for the specified word
    if (tag.startsWith('</' + word)) {
      // If it's a closing tag, check if it's at the begining of the text
      if (tag.length === endIndex + 1) {
        // If yes, remove the tag from the text and set CloseTag and check flags
        text = text.substring(endIndex + 1, text.length);
        CloseTag = tag;
        check = true;
      } else {
        // If it's not the entire tag, set CloseTag and storedOpenTags accordingly
        CloseTag = tag;
        storedOpenTags = '<' + word + '>';
      }
      // Break the loop after processing the closing tag
      break;
    } else if (tag.startsWith('<' + word)) {
      // If it's an opening tag, break the loop
      break;
    }
    endIndex++; // Move to the next '>' character
  }

  // Return an object containing the stored open tags, CloseTag, modified text, and check flag
  return { storedOpenTags, CloseTag, text, check };
}


  
/**
 * Counts and subtracts opening and closing tags related to a specified word in the text.
 * This function iterates through the text to find and process tags (opening and closing)
 * related to the specified word. It counts the occurrences of opening and closing tags,
 * subtracts them based on certain conditions, and handles tag removal and storage.
 * 
 * @param {string} text - The input text string to be analyzed for tags.
 * @param {string} word - The specified word that the function focuses on in the text.
 * @returns {Object} An object containing storedOpenTags, storedCloseTags, and modified text.
 * - storedOpenTags: Any opening tags related to the specified word found in the text.
 * - storedCloseTags: Any closing tags related to the specified word found in the text.
 * - text: The modified text after tag processing.
 */
function countAndSubtractTags(text, word) {
  // Initialize variables to store open tags, closing tags, and flags
  let storedOpenTags = '';
  let storedCloseTags = '';
  let closedtag = false;
  let startIndex = 0;
  let endIndex = 0;
  let startopen = false;
  let countWord1 = (text.match(new RegExp('<' + word, 'g')) || []).length;
  let countWord2 = (text.match(new RegExp('</' + word + '>', 'g')) || []).length;

  // Iterate through the text to find and process tags related to the specified word
  while ((startIndex = text.indexOf('<', endIndex)) !== -1) {
    endIndex = text.indexOf('>', startIndex);
    if (endIndex === -1) {
      break; // Break the loop if no closing '>' character is found
    }

    const tag = text.substring(startIndex, endIndex + 1);

    if (tag.startsWith('</' + word)) {
      // Handle closing tags
      if (!startopen) {
        // If it's the first closing tag encountered, store it in storedCloseTags
        closedtag = true;
        storedCloseTags += text.substring(startIndex, endIndex + 1);
      }
      // Remove the tag from the text and update counters
      text = text.slice(0, startIndex) + text.slice(endIndex + 1);
      startIndex = 0;
      endIndex = 0;
      countWord2--;
    } else if (tag.startsWith('<' + word)) {
      // Handle opening tags
      startopen = true;
      if (countWord2 > 0) {
        // If closing tags are still present, decrement the opening tag counter
        countWord1--;
      } else if (countWord1 > 0 && countWord2 <= 0) {
        // If no closing tags are left but opening tags are present, store in storedOpenTags
        storedOpenTags += text.substring(startIndex, endIndex + 1);
        closedtag = false;
      }
      // Remove the tag from the text and reset indices
      text = text.slice(0, startIndex) + text.slice(endIndex + 1);
      startIndex = 0;
      endIndex = 0;
    }
  }

  // Return an object containing the stored open tags, stored close tags, and modified text
  return { storedOpenTags, storedCloseTags, text };
}

 ////// end of add bold italic underline or color to selected text ////////






  return (
    <>
    
      <div className="container">
      <div className="btn-group" role="group" aria-label="Basic example">
      <button onClick={() => addstyle('b')} type="button" className="btn btn-light btn-sm">
      <FontAwesomeIcon icon={faBold} />
      </button>
      <button onClick={() => addstyle('i')} type="button" className="btn btn-light btn-sm">
      <FontAwesomeIcon icon={faItalic} />
      </button>
      <button onClick={() => addstyle('u')} type="button" className="btn btn-light btn-sm">
      <FontAwesomeIcon icon={faUnderline} />
      </button>
      <button onClick={() => addstyle('strike')} type="button" className="btn btn-light btn-sm">
      <FontAwesomeIcon icon={faStrikethrough} />
      </button>
        <SketchExample onData={changeColor} />
      </div>
    
    </div>
    
    
    <EditorContext.Provider value={{initEditor, editorInstanceRef}}>
        {props.children}
        
    </EditorContext.Provider>
    
    </>

  )
}
export default Editor;