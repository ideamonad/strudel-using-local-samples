import jsdoc from '../../doc.json';
// import { javascriptLanguage } from '@codemirror/lang-javascript';
import { acceptCompletion, autocompletion, closeCompletion, completionKeymap, moveCompletionSelection } from '@codemirror/autocomplete';
import { EditorView, keymap } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { h } from './html';

function plaintext(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

const getDocLabel = (doc) => doc.name || doc.longname;
const getInnerText = (html) => {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export function Autocomplete({ doc, label }) {
  return h`<div class="prose dark:prose-invert max-h-[400px] overflow-auto p-2">
<h1 class="pt-0 mt-0">${label || getDocLabel(doc)}</h1>
${doc.description}
<ul>
  ${doc.params?.map(
    ({ name, type, description }) =>
      `<li>${name} : ${type.names?.join(' | ')} ${description ? ` - ${getInnerText(description)}` : ''}</li>`,
  )}
</ul>
<div>
  ${doc.examples?.map((example) => `<div><pre>${plaintext(example)}</pre></div>`)}
</div>
</div>`[0];
  /*
<pre
className="cursor-pointer"
onMouseDown={(e) => {
  console.log('ola!');
  navigator.clipboard.writeText(example);
  e.stopPropagation();
}}
>
{example}
</pre>
*/
}

const jsdocCompletions = jsdoc.docs
  .filter(
    (doc) =>
      getDocLabel(doc) &&
      !getDocLabel(doc).startsWith('_') &&
      !['package'].includes(doc.kind) &&
      !['superdirtOnly', 'noAutocomplete'].some((tag) => doc.tags?.find((t) => t.originalTitle === tag)),
  )
  // https://codemirror.net/docs/ref/#autocomplete.Completion
  .map((doc) /*: Completion */ => ({
    label: getDocLabel(doc),
    // detail: 'xxx', // An optional short piece of information to show (with a different style) after the label.
    info: () => Autocomplete({ doc }),
    type: 'function', // https://codemirror.net/docs/ref/#autocomplete.Completion.type
  }));

export const strudelAutocomplete = (context /* : CompletionContext */) => {
  let word = context.matchBefore(/\w*/);
  if (word.from == word.to && !context.explicit) return null;
  
  return {
    from: word.from,
    options: jsdocCompletions,
    /*     options: [
      { label: 'match', type: 'keyword' },
      { label: 'hello', type: 'variable', info: '(World)' },
      { label: 'magic', type: 'text', apply: '⠁⭒*.✩.*⭒⠁', detail: 'macro' },
    ], */
  };
};

const WORKS_DIR='works'

let fetchFiles = async function () {
  const response = await fetch(`/api/list?dir=${WORKS_DIR}`);
  return response.json();
}

function extractPartsFromText(text) {
  const parts = [];
  const stack = []; // 用于处理嵌套的栈
  const lines = text.split('\n');
  let currentPart = null;

  for (const line of lines) {
    const trimmedLine = line.trimStart();

    // 检测 part-begin 标记
    const partBeginMatch = trimmedLine.match(/^\/\/@part-begin:[\s]*([^\s]+)/);
    if (partBeginMatch) {
      // 如果有正在记录的 part，先暂停记录（嵌套）
      if (currentPart) {
        stack.push(currentPart);
      }
      // 开始新的 part
      currentPart = {
        label: partBeginMatch[1],
        text: '',
        // startLine: true // 标记为新 part 的开始
      };
      continue;
    }

    // 检测 part-end 标记
    const partEndMatch = trimmedLine.match(/^\/\/@part-end/);
    if (partEndMatch) {
      if (!currentPart) {
        throw new Error('Unmatched part-end tag');
      }
      // 保存当前 part
      parts.push({
        label: currentPart.label,
        text: currentPart.text
      });

      // 恢复上一个 part（如果有）
      let parrentPart = stack.pop();
      if(parrentPart) {
        parrentPart.text = parrentPart.text + currentPart.text;
      }
      currentPart = parrentPart; 

      continue;
    }

    // 普通行处理
    if (currentPart) {
      // 添加到当前 part 内容
      currentPart.text += line + '\n';
    }
  }

  // 检查未闭合的 part
  if (currentPart || stack.length > 0) {
    throw new Error('Unclosed part-begin tag');
  }

  return parts;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

const updateSpellStateEffect = StateEffect.define();

const spellStateField = StateField.define({
  create: () => ({ 
    stepwise: true
  }),
  update: (value, transaction) => {

    for (let e of transaction.effects)
    {
      if (e.is(updateSpellStateEffect))
      {
        value = e.value
      }
    }

    return value
  }
});

function makeWriter(word, completion) {
  return (view, _, from, to) => {
    const spellState = view.state.field(spellStateField);
    
    if(!spellState.stepwise) { 
      let cursorPos = word.from + completion.length;   
      view.dispatch({
        changes: { from: from, to: to, insert: completion },
        selection: { anchor: cursorPos },
        effects: EditorView.scrollIntoView(
          cursorPos, 
          { y: "center" })
      });
      return;
    }

    view.dispatch({
      changes: { from: word.from, to: word.to },
      selection: { anchor: word.from }
    });

    let i = 0;
    const insert = () => {
      if (i < completion.length) {
        let cursorPos = from + i + 1;
        view.dispatch({
          changes: { from: from + i, insert: completion[i] },
          selection: { anchor: cursorPos },
          effects: EditorView.scrollIntoView(cursorPos, { y: "center" })
        });
        i++;
        setTimeout(insert, getRandomArbitrary(20, 60));
      }
    };
    insert();
  }
}

export const spellAutocomplete = async (context /* : CompletionContext */) => {
  // 检测是否输入了@magic（精确匹配）
  // let word = context.matchBefore(/@[^\s]+/);
  // let word = context.matchBefore(/@\w*/);
  let word = context.matchBefore(/@[^\s]+/);
  // if (!word || word.from == word.to)
  if (!word || word.from == word.to && !context.explicit) return null;
  let fname = word.text.substring(1);

  if (fname.length <= 0) return null;

  let fullName = fname + '.js';

  const fileTable = await fetchFiles();
  if(!fileTable[fullName]) return null;

  let url = `/${WORKS_DIR}/${fullName}`
  var text = "";
  try {
    const response = await fetch(url);
    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    text = await response.text();
  } catch (error) {
    console.error(`Fetch ${url} error:`, error);
    return null;
  }

  let parts = extractPartsFromText(text);
  let options = parts.map(
    (x) => ({
        label: x.label, 
        apply: makeWriter(word, x.text)
      })
  )

  return {
    from: word.from,
    to: word.to,
    filter: false,
    options: options,
  };
}

const spellKeymap = keymap.of([
  // ...completionKeymap, // 默认的自动补全键位映射
  {
    key: 'ArrowUp',
    //preventDefault: true,
    run: moveCompletionSelection(false),
  },
  {
    key: 'Ctrl-u',
    // preventDefault: true,
    run: moveCompletionSelection(false),
  },
  {
    key: 'ArrowDown',
    // preventDefault: true,
    run: moveCompletionSelection(true),
  },
  {
    key: 'Ctrl-j',
    // preventDefault: true,
    run: moveCompletionSelection(true),
  },
  {
    key: 'PageDown',
    // preventDefault: true,
    run: moveCompletionSelection(true, "page"),
  },
  {
    key: 'Ctrl-k',
    // preventDefault: true,
    run: moveCompletionSelection(true, "page"),
  },
  {
    key: 'PageUp',
    // preventDefault: true,
    run: moveCompletionSelection(false, "page"),
  },
  {
    key: 'Ctrl-i',
    // preventDefault: true,
    run: moveCompletionSelection(false, "page"),
  },
  {
    key: 'Enter',
    // preventDefault: true,
    run: (view) => {
      view.dispatch({
        effects: updateSpellStateEffect.of({stepwise:false})
      });
      acceptCompletion(view);
      return false;
    }
  },
  {
    key: 'Ctrl-;',
    // preventDefault: true,
    run: (view) => {
      view.dispatch({
        effects: updateSpellStateEffect.of({stepwise:true})
      });
      acceptCompletion(view);
      return true;
    }
  },
  {
    key: 'Escape',
    // preventDefault: true,
    run: closeCompletion,
  },
]);

export function isAutoCompletionEnabled(on) {
  return on
    ? [
        autocompletion({ 
          override: [
            spellAutocomplete, 
          ],
          defaultKeymap: false
        }),
        //javascriptLanguage.data.of({ autocomplete: strudelAutocomplete }),
        spellKeymap,
        spellStateField,
      ]
    : []; // autocompletion({ override: [] })
}
