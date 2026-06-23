// ─────────────────────────────────────────────────────────────────────────────
// coding-problems.js  —  Controller and database for Flashcards Challenge Arena
// ─────────────────────────────────────────────────────────────────────────────

import { getProfile } from "./auth.js";

// ── QUESTIONS DATABASE ───────────────────────────────────────────────────────
const QUESTIONS_DB = {
  python: {
    easy: [
      {
        question: "What is the output of print(type([])) in Python?",
        code: "print(type([]))",
        options: [
          "<class 'list'>",
          "<class 'array'>",
          "<class 'dict'>",
          "<class 'tuple'>"
        ],
        answer: 0,
        explanation: "In Python, [] creates an empty list. The type() function returns the class of the object, which is <class 'list'>."
      },
      {
        question: "How do you insert an element at the end of a list?",
        code: "my_list = [1, 2]\n# Insert element 3 at the end",
        options: [
          "my_list.add(3)",
          "my_list.insert(3)",
          "my_list.append(3)",
          "my_list.push(3)"
        ],
        answer: 2,
        explanation: "The append() method adds an item to the end of a list in Python."
      },
      {
        question: "What is the correct syntax to create a function in Python?",
        code: "",
        options: [
          "def myFunction():",
          "function myFunction():",
          "create myFunction():",
          "def myFunction {}"
        ],
        answer: 0,
        explanation: "Python uses the 'def' keyword to define functions, followed by the function name, parentheses, and a colon."
      },
      {
        question: "What is the output of 3 * 'Py'?",
        code: "result = 3 * 'Py'\nprint(result)",
        options: [
          "PyPyPy",
          "Py3",
          "Error",
          "Py Py Py"
        ],
        answer: 0,
        explanation: "In Python, multiplying a string by an integer duplicates the string that many times."
      }
    ],
    medium: [
      {
        question: "What is the output of this list comprehension?",
        code: "nums = [i for i in range(5) if i % 2 == 0]\nprint(nums)",
        options: [
          "[0, 2, 4]",
          "[2, 4]",
          "[0, 1, 2, 3, 4]",
          "[1, 3]"
        ],
        answer: 0,
        explanation: "range(5) yields integers from 0 to 4. The list comprehension filters out odd numbers, keeping 0, 2, and 4."
      },
      {
        question: "Which of the following is used to handle exceptions in Python?",
        code: "",
        options: [
          "try...catch",
          "try...except",
          "try...catch...finally",
          "do...catch"
        ],
        answer: 1,
        explanation: "Python uses the try...except block (optionally with 'else' and 'finally') to handle exceptions."
      },
      {
        question: "What is the output of print({1, 2, 2, 3})?",
        code: "print({1, 2, 2, 3})",
        options: [
          "{1, 2, 2, 3}",
          "{1, 2, 3}",
          "[1, 2, 3]",
          "(1, 2, 3)"
        ],
        answer: 1,
        explanation: "Curly brackets {} with comma-separated values define a set in Python. Sets automatically de-duplicate values."
      },
      {
        question: "How can you copy a list 'a' by value, not by reference?",
        code: "a = [1, 2, 3]",
        options: [
          "b = a",
          "b = a.copy()",
          "b = list(a)",
          "Both b = a.copy() and b = a[:]"
        ],
        answer: 3,
        explanation: "Both a.copy() and slicing a[:] create shallow copies (by value). 'b = a' just copies the reference to the same list object."
      }
    ],
    hard: [
      {
        question: "What is the output of the following code?",
        code: "def f(x, l=[]):\n    l.append(x)\n    return l\n\nprint(f(1))\nprint(f(2))",
        options: [
          "[1] and [2]",
          "[1] and [1, 2]",
          "[1] and [2, 2]",
          "Error"
        ],
        answer: 1,
        explanation: "In Python, default arguments are evaluated once when the function is defined. The same list 'l' is reused across calls."
      },
      {
        question: "In Python, what does the __slots__ attribute do?",
        code: "class MyClass:\n    __slots__ = ['name', 'age']",
        options: [
          "Allows dynamic attribute creation",
          "Restricts attribute creation to save memory",
          "Defines subclass structures",
          "Acts as a constructor wrapper"
        ],
        answer: 1,
        explanation: "__slots__ prevents the automatic creation of a __dict__ for each instance, restricting properties and saving substantial memory."
      },
      {
        question: "What is a decorator in Python?",
        code: "",
        options: [
          "A function that modifies the behavior of another function",
          "A graphical UI library wrapper",
          "A class constructor modifier",
          "A built-in class formatting tool"
        ],
        answer: 0,
        explanation: "A decorator is a design pattern that allows extending or modifying the behavior of a function or class without modifying its source code."
      },
      {
        question: "What is the output of bool('False')?",
        code: "print(bool('False'))",
        options: [
          "False",
          "True",
          "None",
          "Error"
        ],
        answer: 1,
        explanation: "In Python, any non-empty string evaluates to True when cast to a boolean, regardless of the text it contains."
      }
    ]
  },
  javascript: {
    easy: [
      {
        question: "What is the output of typeof null in JavaScript?",
        code: "console.log(typeof null);",
        options: [
          "\"null\"",
          "\"undefined\"",
          "\"object\"",
          "\"number\""
        ],
        answer: 2,
        explanation: "In JavaScript, typeof null returns 'object'. This is a historical bug in the language that cannot be fixed without breaking web compatibility."
      },
      {
        question: "Which keyword is block-scoped in ES6?",
        code: "",
        options: [
          "var",
          "let",
          "function",
          "define"
        ],
        answer: 1,
        explanation: "Variables declared with 'let' and 'const' are block-scoped, whereas 'var' variables are function-scoped."
      },
      {
        question: "What is the output of '5' + 3?",
        code: "console.log('5' + 3);",
        options: [
          "8",
          "\"53\"",
          "NaN",
          "Error"
        ],
        answer: 1,
        explanation: "JavaScript performs string concatenation when one of the operands of the '+' operator is a string, yielding the string '53'."
      },
      {
        question: "How do you write a single-line comment in JavaScript?",
        code: "",
        options: [
          "# comment",
          "// comment",
          "<!-- comment -->",
          "/* comment"
        ],
        answer: 1,
        explanation: "JavaScript uses double slashes '//' for single-line comments, and '/* ... */' for multi-line comments."
      }
    ],
    medium: [
      {
        question: "What is the output of [] == ![] in JavaScript?",
        code: "console.log([] == ![]);",
        options: [
          "true",
          "false",
          "TypeError",
          "undefined"
        ],
        answer: 0,
        explanation: "[] is truthy, so ![] is false. The comparison then becomes [] == false. JavaScript coerces [] to a primitive (empty string \"\") and false to 0, which yields 0 == 0 (true)."
      },
      {
        question: "What does the Function.prototype.bind method do?",
        code: "const boundFn = fn.bind(thisArg);",
        options: [
          "Invokes a function immediately",
          "Creates a new function with a bound context",
          "Binds an element to the DOM",
          "Combines two arrays"
        ],
        answer: 1,
        explanation: "The bind() method creates a new function that, when called, has its 'this' keyword set to the provided value."
      },
      {
        question: "What is the output of console.log(0.1 + 0.2 === 0.3)?",
        code: "console.log(0.1 + 0.2 === 0.3);",
        options: [
          "true",
          "false",
          "undefined",
          "NaN"
        ],
        answer: 1,
        explanation: "Due to IEEE 754 floating-point representation, 0.1 + 0.2 equals 0.30000000000000004, which is not exactly 0.3."
      },
      {
        question: "What is a closure in JavaScript?",
        code: "",
        options: [
          "Closing a browser tab",
          "A function that retains references to variables from its outer scope",
          "An array-clearing method",
          "A self-destructing variable"
        ],
        answer: 1,
        explanation: "A closure is the combination of a function bundled together with references to its surrounding state (lexical environment)."
      }
    ],
    hard: [
      {
        question: "What is the output of the following code?",
        code: "const a = {};\nconst b = { key: 'b' };\nconst c = { key: 'c' };\n\na[b] = 123;\na[c] = 456;\n\nconsole.log(a[b]);",
        options: [
          "123",
          "456",
          "undefined",
          "TypeError"
        ],
        answer: 1,
        explanation: "When setting an object property, JavaScript stringifies keys. Both b and c stringify to '[object Object]', so a[c] overwrites a[b]."
      },
      {
        question: "What is the primary difference between Map and WeakMap?",
        code: "",
        options: [
          "WeakMap allows primitive keys only",
          "WeakMap allows keys to be garbage-collected if no other references exist",
          "Map is faster than WeakMap",
          "WeakMap is deprecated"
        ],
        answer: 1,
        explanation: "In WeakMap, keys must be objects and are held weakly. If there are no other references to the key object, it can be garbage collected."
      },
      {
        question: "What is the event loop in JavaScript?",
        code: "",
        options: [
          "A loop that repeats events",
          "A mechanism for executing asynchronous tasks using a call stack and task queue",
          "A built-in method for array iteration",
          "A server-side event listener"
        ],
        answer: 1,
        explanation: "The event loop coordinates the execution of code, collection and processing of events, and execution of queued sub-tasks."
      },
      {
        question: "What is the output of the following code?",
        code: "(() => {\n  let x, y;\n  try {\n    throw new Error();\n  } catch (x) {\n    x = 1;\n    y = 2;\n    console.log(x);\n  }\n  console.log(x);\n  console.log(y);\n})();",
        options: [
          "1, 1, 2",
          "1, undefined, 2",
          "1, 1, undefined",
          "Error"
        ],
        answer: 1,
        explanation: "The catch block parameter 'x' is shadowed inside the block. Assigning 'x = 1' modifies this shadowed variable, not the outer 'x'."
      }
    ]
  },
  java: {
    easy: [
      {
        question: "Which data type is used to create a variable that stores text in Java?",
        code: "",
        options: [
          "txt",
          "String",
          "string",
          "Char"
        ],
        answer: 1,
        explanation: "Java uses the capitalized 'String' class to store sequences of text."
      },
      {
        question: "What is the entry point method signature for any Java application?",
        code: "",
        options: [
          "public void main(String args)",
          "public static void main(String[] args)",
          "static void main(string[])",
          "void main()"
        ],
        answer: 1,
        explanation: "Java applications start execution from 'public static void main(String[] args)'."
      },
      {
        question: "How do you find the length of a string s in Java?",
        code: "String s = \"StudyPy\";",
        options: [
          "s.length",
          "s.length()",
          "s.size()",
          "s.count()"
        ],
        answer: 1,
        explanation: "In Java, strings are objects and have a length() method to retrieve the character count."
      },
      {
        question: "Which operator is used to compare two primitives for equality in Java?",
        code: "",
        options: [
          "=",
          "==",
          "equals",
          "is"
        ],
        answer: 1,
        explanation: "Java uses '==' to compare primitives. For objects, the equals() method should be used."
      }
    ],
    medium: [
      {
        question: "What is the main difference between HashMap and TreeMap?",
        code: "",
        options: [
          "HashMap is sorted, TreeMap is not",
          "TreeMap maintains natural ordering of keys, HashMap does not",
          "HashMap is thread-safe, TreeMap is not",
          "TreeMap uses hashing, HashMap uses trees"
        ],
        answer: 1,
        explanation: "TreeMap maintains sorted key ordering based on their natural comparison or a custom Comparator. HashMap does not guarantee any order."
      },
      {
        question: "Which keyword is used to inherit a class in Java?",
        code: "class SubClass ______ SuperClass {}",
        options: [
          "implements",
          "extends",
          "inherits",
          "import"
        ],
        answer: 1,
        explanation: "Java uses the 'extends' keyword for class inheritance, and 'implements' for interface implementation."
      },
      {
        question: "What does garbage collection do in Java?",
        code: "",
        options: [
          "Clears the console log",
          "Reclaims heap memory occupied by unreachable objects",
          "Deletes unused class files",
          "Monitors network requests"
        ],
        answer: 1,
        explanation: "The Garbage Collector (GC) runs automatically in the background to clean up dynamically allocated objects that are no longer referenced."
      },
      {
        question: "What is the output of System.out.println(10 + 20 + \"Java\");?",
        code: "System.out.println(10 + 20 + \"Java\");",
        options: [
          "Java1020",
          "30Java",
          "Java30",
          "Error"
        ],
        answer: 1,
        explanation: "Java evaluates arithmetic expressions left-to-right. 10 + 20 is calculated first (30), and then concatenated with the string \"Java\"."
      }
    ],
    hard: [
      {
        question: "What will happen if we try to override a static method in Java?",
        code: "",
        options: [
          "Compilation error",
          "Runtime exception",
          "It hides the parent class method (method hiding)",
          "It overrides it normally"
        ],
        answer: 2,
        explanation: "Static methods belong to classes, not instances. A static method in a subclass hides the static method of the parent class, rather than overriding it."
      },
      {
        question: "What is the purpose of the volatile keyword in Java?",
        code: "private volatile boolean active = true;",
        options: [
          "Prevents modification of a variable",
          "Guarantees that variable reads and writes are synchronized directly to main memory",
          "Optimizes memory allocations",
          "Compiles the variable to native code"
        ],
        answer: 1,
        explanation: "The volatile keyword ensures that changes to a variable are immediately visible to other threads, bypassing thread caches."
      },
      {
        question: "Which of the following is true about Java's ClassLoader?",
        code: "",
        options: [
          "It loads classes dynamically at runtime",
          "It compiles source code to bytecode",
          "It executes bytecodes directly",
          "It manages heap allocations"
        ],
        answer: 0,
        explanation: "ClassLoaders are responsible for loading class files dynamically into memory during program execution when they are first referenced."
      },
      {
        question: "What is the difference between checked and unchecked exceptions?",
        code: "",
        options: [
          "Checked exceptions are checked at compile-time, unchecked are runtime",
          "Unchecked exceptions are checked at compile-time, checked are runtime",
          "Checked exceptions are handled by JVM, unchecked by developer",
          "There is no difference"
        ],
        answer: 0,
        explanation: "Checked exceptions must be declared in the throws clause or caught (handled) in the source code; unchecked exceptions do not require compile-time checks."
      }
    ]
  },
  cpp: {
    easy: [
      {
        question: "Which header file is required for input-output stream in C++?",
        code: "",
        options: [
          "#include <stdio.h>",
          "#include <iostream>",
          "#include <stream>",
          "#include <conio.h>"
        ],
        answer: 1,
        explanation: "C++ standard stream functions like cin and cout are declared in the <iostream> header."
      },
      {
        question: "How do you print a line to console in C++?",
        code: "",
        options: [
          "print(\"text\");",
          "System.out.println(\"text\");",
          "std::cout << \"text\";",
          "Console.Write(\"text\");"
        ],
        answer: 2,
        explanation: "C++ uses 'std::cout' along with the insertion operator '<<' to print values to the standard console."
      },
      {
        question: "What is the size of a char in C++ (by standard)?",
        code: "std::cout << sizeof(char);",
        options: [
          "1 byte",
          "2 bytes",
          "4 bytes",
          "8 bits"
        ],
        answer: 0,
        explanation: "C++ guarantees that sizeof(char) is always exactly 1, representing 1 byte."
      },
      {
        question: "Which operator is used to get the memory address of a variable?",
        code: "int num = 10;\n// Get address of num",
        options: [
          "*",
          "&",
          "^",
          "@"
        ],
        answer: 1,
        explanation: "The address-of operator '&' returns the memory address pointer of its operand."
      }
    ],
    medium: [
      {
        question: "What is a reference variable in C++?",
        code: "int a = 10;\nint& ref = a;",
        options: [
          "A pointer to another variable",
          "An alias or alternative name for an existing variable",
          "A dynamic allocation tool",
          "A floating point storage"
        ],
        answer: 1,
        explanation: "A reference variable in C++ behaves as an alias (another name) for a previously declared variable."
      },
      {
        question: "What is the purpose of a virtual destructor in C++?",
        code: "class Base {\npublic:\n    virtual ~Base();\n};",
        options: [
          "To delete variables faster",
          "To ensure subclass destructors are called when deleting via a base pointer",
          "To declare interface classes",
          "To make class structures immutable"
        ],
        answer: 1,
        explanation: "Declaring a base class destructor virtual ensures that derived class destructors are correctly triggered, preventing memory leaks when deleting an object through a pointer to the base class."
      },
      {
        question: "What is the output of std::cout << (5 >> 1);?",
        code: "std::cout << (5 >> 1);",
        options: [
          "5",
          "2",
          "10",
          "1"
        ],
        answer: 1,
        explanation: "The right-shift operator '>>' shifts bits to the right. 5 in binary is 101; shifting right by 1 bit yields 10 (which is 2)."
      },
      {
        question: "Which container in the C++ Standard Template Library (STL) uses a contiguous memory array?",
        code: "",
        options: [
          "std::list",
          "std::vector",
          "std::map",
          "std::set"
        ],
        answer: 1,
        explanation: "std::vector guarantees contiguous memory storage, allowing constant-time O(1) random access."
      }
    ],
    hard: [
      {
        question: "What is SFINAE in C++ template programming?",
        code: "",
        options: [
          "Simple Function Indexing and Name Allocation Engine",
          "Substitution Failure Is Not An Error",
          "Static Function Initialization And Execution",
          "Standard File Input/Output Native Access Extension"
        ],
        answer: 1,
        explanation: "SFINAE stands for Substitution Failure Is Not An Error. It means that if a template parameters substitution fails, the template is simply discarded instead of raising a compilation error."
      },
      {
        question: "What is the difference between std::unique_ptr and std::shared_ptr?",
        code: "",
        options: [
          "unique_ptr is thread-safe, shared_ptr is not",
          "unique_ptr manages sole ownership of a resource, shared_ptr allows multiple co-owners using reference-counting",
          "shared_ptr is faster than unique_ptr",
          "They are identical"
        ],
        answer: 1,
        explanation: "unique_ptr owns a resource uniquely (cannot be copied, only moved). shared_ptr shares ownership, tracking references dynamically and deallocating memory once reference count reaches 0."
      },
      {
        question: "What is template specialization in C++?",
        code: "template <>\nclass MyClass<int> { ... };",
        options: [
          "Compiling templates under a separate thread",
          "Providing a custom implementation of a template for specific template arguments",
          "Pre-allocating vector memories",
          "Excluding templates from compiling"
        ],
        answer: 1,
        explanation: "Template specialization allows defining alternative class or function designs for specific argument datatypes."
      },
      {
        question: "What does the std::move function do in C++?",
        code: "auto b = std::move(a);",
        options: [
          "Physically moves data in memory",
          "Converts its argument into an rvalue reference to enable move semantics",
          "Terminates a thread loop",
          "Copies a variable into a new address"
        ],
        answer: 1,
        explanation: "std::move does not actually move any data at runtime; it merely casts its parameter to an rvalue reference, allowing compilers to substitute copy operations with move operators."
      }
    ]
  }
};

// ── STATE VARIABLES ─────────────────────────────────────────────────────────
let selectedLanguage = "";
let selectedDifficulty = "";
let questionsList = [];
let score = 0;
let currentIndex = 0;
let selectedOptionIdx = null;
let isSubmitted = false;

// ── DOM ELEMENTS ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  setupEventListeners();
  loadProfileHeader();
});

function initNavbar() {
  // Check if navbar placeholder exists
  const placeholder = document.getElementById("navbar-placeholder");
  if (placeholder) {
    // If we are in challenges subdirectory, adjust paths if necessary, script.js handles it.
  }
}

async function loadProfileHeader() {
  try {
    const res = await getProfile();
    if (res.authenticated && res.user) {
      const authItem = document.getElementById("nav-auth-item");
      if (authItem) {
        authItem.innerHTML = `<a href="/pages/settings.html" style="display:flex; align-items:center; gap:8px;">
          <img src="${res.user.avatar || '/assets/images/lugu-bg.png'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
          ${res.user.username}
        </a>`;
      }
    }
  } catch (e) {
    console.warn("Auth check failed:", e);
  }
}

function setupEventListeners() {
  // Language selectors
  const langCards = document.querySelectorAll(".lang-card-select");
  langCards.forEach(card => {
    card.addEventListener("click", () => {
      langCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedLanguage = card.dataset.lang;
      checkStartAbility();
    });
  });

  // Difficulty selectors
  const diffBtns = document.querySelectorAll(".diff-btn");
  diffBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      diffBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedDifficulty = btn.dataset.diff;
      checkStartAbility();
    });
  });

  // Start Button
  const startBtn = document.getElementById("btn-start-challenge");
  if (startBtn) {
    startBtn.addEventListener("click", startChallenge);
  }

  // Back buttons
  const backBtns = document.querySelectorAll(".back-to-setup");
  backBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      resetToSetup();
    });
  });
}

function checkStartAbility() {
  const startBtn = document.getElementById("btn-start-challenge");
  if (!startBtn) return;
  
  if (selectedLanguage && selectedDifficulty) {
    startBtn.removeAttribute("disabled");
  } else {
    startBtn.setAttribute("disabled", "true");
  }
}

function startChallenge() {
  if (!selectedLanguage || !selectedDifficulty) return;

  const dataset = QUESTIONS_DB[selectedLanguage]?.[selectedDifficulty];
  if (!dataset || dataset.length === 0) {
    alert("No questions found for this configuration.");
    return;
  }

  // Shuffle questions copy
  questionsList = [...dataset].sort(() => Math.random() - 0.5);
  
  // Reset state
  score = 0;
  currentIndex = 0;
  isSubmitted = false;
  selectedOptionIdx = null;

  // Toggle Containers
  document.getElementById("setup-container").classList.add("hidden");
  document.getElementById("results-container").classList.add("hidden");
  document.getElementById("arena-container").classList.remove("hidden");

  // Setup stats
  const langName = {
    python: "Python",
    javascript: "JavaScript",
    java: "Java",
    cpp: "C++"
  }[selectedLanguage];
  
  document.getElementById("arena-lang-title").textContent = `${langName} - ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}`;
  updateStatsPanel();

  // Initialize and Render Card Stack
  initStackDOM();
  renderStackState();
}

function updateStatsPanel() {
  document.getElementById("score-val").textContent = score;
  document.getElementById("progress-text").textContent = `${currentIndex + 1} / ${questionsList.length}`;
  
  const pct = (currentIndex / questionsList.length) * 100;
  document.getElementById("arena-progress-bar").style.width = `${pct}%`;
}

// ── CARD STACK ENGINE ────────────────────────────────────────────────────────
let cardElements = []; // Persistent A, B, C cards

function initStackDOM() {
  const container = document.getElementById("flashcard-stack");
  if (!container) return;
  container.innerHTML = "";

  cardElements = [];

  // Create three persistent card objects
  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.id = `card-stack-item-${i}`;
    card.className = "flashcard-item card--hidden";
    container.appendChild(card);
    cardElements.push(card);
  }
}

function renderStackState() {
  isSubmitted = false;
  selectedOptionIdx = null;

  // We assign questions to our persistent card elements based on currentIndex
  // Card index 0 in DOM holds currentIndex
  // Card index 1 in DOM holds currentIndex + 1
  // Card index 2 in DOM holds currentIndex + 2
  
  // Clean classes
  cardElements.forEach(el => {
    el.className = "flashcard-item card--hidden";
  });

  const cardsToAssign = [
    { elIndex: 0, qIndex: currentIndex, styleClass: "card--front" },
    { elIndex: 1, qIndex: currentIndex + 1, styleClass: "card--middle" },
    { elIndex: 2, qIndex: currentIndex + 2, styleClass: "card--back" }
  ];

  cardsToAssign.forEach(config => {
    if (config.qIndex < questionsList.length) {
      const cardEl = cardElements[config.elIndex];
      cardEl.className = `flashcard-item ${config.styleClass}`;
      
      // Populate content
      populateCardData(cardEl, questionsList[config.qIndex], config.qIndex);
      
      // Bind event listeners only to the active card
      if (config.styleClass === "card--front") {
        bindFrontCardActions(cardEl);
      }
    }
  });
  
  updateStatsPanel();
}

function populateCardData(cardEl, qData, qIdx) {
  const isCodeAvailable = qData.code && qData.code.trim().length > 0;
  const escapedCode = isCodeAvailable ? escapeHtml(qData.code) : "";
  
  cardEl.innerHTML = `
    <div>
      <div class="card-tags">
        <span class="tag-badge ${selectedDifficulty}">${selectedDifficulty}</span>
        <span class="q-num">Question ${qIdx + 1}/${questionsList.length}</span>
      </div>
      <div class="card-question">
        ${qData.question}
      </div>
      ${isCodeAvailable ? `<pre class="code-block"><code>${escapedCode}</code></pre>` : ""}
      <div class="options-list">
        ${qData.options.map((opt, idx) => `
          <button class="option-card-btn" data-idx="${idx}">
            <span>${escapeHtml(opt)}</span>
            <i class="bx bx-check-circle"></i>
          </button>
        `).join("")}
      </div>
    </div>
    <div class="card-actions-panel">
      <div class="feedback-text hidden" id="card-feedback-${qIdx}"></div>
      <button class="btn-submit-answer" id="card-action-btn-${qIdx}" disabled>
        Submit Answer <i class="bx bx-check"></i>
      </button>
    </div>
  `;
}

function bindFrontCardActions(cardEl) {
  const qIdx = currentIndex;
  const qData = questionsList[qIdx];
  const optionBtns = cardEl.querySelectorAll(".option-card-btn");
  const submitBtn = cardEl.querySelector(`#card-action-btn-${qIdx}`);
  const feedbackEl = cardEl.querySelector(`#card-feedback-${qIdx}`);

  optionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (isSubmitted) return;

      optionBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      
      selectedOptionIdx = parseInt(btn.dataset.idx);
      submitBtn.removeAttribute("disabled");
    });
  });

  submitBtn.addEventListener("click", () => {
    if (!isSubmitted) {
      // Evaluate Answer
      isSubmitted = true;
      optionBtns.forEach(b => b.setAttribute("disabled", "true"));
      
      const correctIdx = qData.answer;
      
      // Select visual classes
      optionBtns.forEach(btn => {
        const idx = parseInt(btn.dataset.idx);
        if (idx === correctIdx) {
          btn.classList.add("correct");
        } else if (idx === selectedOptionIdx) {
          btn.classList.add("incorrect");
          // Change icon to cross
          btn.querySelector("i").className = "bx bx-x-circle";
        }
      });

      // Feedback display
      feedbackEl.classList.remove("hidden");
      if (selectedOptionIdx === correctIdx) {
        score++;
        feedbackEl.className = "feedback-text success";
        feedbackEl.innerHTML = `<i class="bx bxs-check-circle"></i> Correct!`;
      } else {
        feedbackEl.className = "feedback-text danger";
        feedbackEl.innerHTML = `<i class="bx bxs-x-circle"></i> Incorrect!`;
      }

      // Convert button to Next
      submitBtn.className = "btn-next-card";
      submitBtn.innerHTML = `Next Card <i class="bx bx-right-arrow-alt"></i>`;
      
      // Update running scores
      document.getElementById("score-val").textContent = score;
    } else {
      // Trigger Card Rotation and Next state
      rotateCardStack();
    }
  });
}

function rotateCardStack() {
  const frontCard = cardElements[0];
  
  // 1. Arc Animation Out
  frontCard.classList.add("card--slide-out");
  
  // 2. Shift others visually
  // Middle -> Front
  if (cardElements[1]) {
    cardElements[1].className = "flashcard-item card--front";
  }
  // Back -> Middle
  if (cardElements[2]) {
    cardElements[2].className = "flashcard-item card--middle";
  }
  
  // Wait for 3D translation to complete
  setTimeout(() => {
    // 3. Move index
    currentIndex++;
    
    if (currentIndex >= questionsList.length) {
      showResults();
    } else {
      // Rotate indices in our persistent elements
      // Shift array left so Card 1 becomes Card 0, Card 2 becomes Card 1, and the old Card 0 becomes Card 2
      const oldFront = cardElements.shift(); 
      cardElements.push(oldFront);
      
      // Render next batch
      // Old front is now cardElements[2] (Back). Let's load the next question (currentIndex + 2) into it
      const nextQIndex = currentIndex + 2;
      
      if (nextQIndex < questionsList.length) {
        oldFront.className = "flashcard-item card--hidden";
        populateCardData(oldFront, questionsList[nextQIndex], nextQIndex);
        
        // Wait briefly, then move from hidden to back
        setTimeout(() => {
          oldFront.className = "flashcard-item card--back";
        }, 50);
      } else {
        // No more items to feed back, hide it
        oldFront.className = "flashcard-item card--hidden";
      }

      // Reset per-card state before binding the new front card
      isSubmitted = false;
      selectedOptionIdx = null;

      // Re-assign event listeners to the new front (which is now cardElements[0])
      bindFrontCardActions(cardElements[0]);
      
      // Update statistics
      updateStatsPanel();
    }
  }, 600); // syncs with transitions
}

// ── SHOW RESULTS ─────────────────────────────────────────────────────────────
function showResults() {
  document.getElementById("arena-container").classList.add("hidden");
  
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.classList.remove("hidden");

  // Populate data
  document.getElementById("res-score").textContent = score;
  document.getElementById("res-total").textContent = questionsList.length;
  
  const percent = Math.round((score / questionsList.length) * 100);
  document.getElementById("res-percent").textContent = `${percent}%`;
  
  // Circular progress loader
  const circleFill = document.querySelector(".circle-fill");
  if (circleFill) {
    // Circumference = 2 * pi * r = 2 * 3.14159 * 70 = 439.8 (approx 440)
    const offset = 440 - (440 * percent) / 100;
    
    // Add brief timeout for transition visibility
    setTimeout(() => {
      circleFill.style.strokeDashoffset = offset;
    }, 150);
  }

  // Dynamic trophy icon
  const trophy = document.getElementById("res-trophy");
  if (percent === 100) {
    trophy.className = "bx bxs-trophy success-trophy";
    trophy.style.color = "#f39c12"; // Golden
  } else if (percent >= 75) {
    trophy.className = "bx bxs-award success-trophy";
    trophy.style.color = "#a0a0a0"; // Silver
  } else if (percent >= 50) {
    trophy.className = "bx bxs-medal success-trophy";
    trophy.style.color = "#cd7f32"; // Bronze
  } else {
    trophy.className = "bx bx-message-alt-error success-trophy";
    trophy.style.color = "#e74c3c"; // Red warning
  }
}

function resetToSetup() {
  document.getElementById("arena-container").classList.add("hidden");
  document.getElementById("results-container").classList.add("hidden");
  document.getElementById("setup-container").classList.remove("hidden");
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
