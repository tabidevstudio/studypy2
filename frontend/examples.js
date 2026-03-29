const EXAMPLES = {
  python: [
    {
      label: 'Hello World',
      code: `# Hello World
print("Hello, World!")
print("Welcome to StudyPY!")`,
    },
    {
      label: 'Variables & Data Types',
      code: `# Variables & Data Types
name = "Alice"          # string
age = 20                # integer
gpa = 3.85              # float
is_enrolled = True      # boolean

print(f"Name: {name}")
print(f"Age: {age}")
print(f"GPA: {gpa}")
print(f"Enrolled: {is_enrolled}")
print(f"Type of age: {type(age)}")`,
    },
    {
      label: 'If/Else Conditions',
      code: `# If/Else Conditions
grade = 85

if grade >= 90:
    print("A - Excellent!")
elif grade >= 80:
    print("B - Good job!")
elif grade >= 70:
    print("C - Passing")
elif grade >= 60:
    print("D - Needs improvement")
else:
    print("F - Failed")`,
    },
    {
      label: 'Loops',
      code: `# For loop
print("For loop:")
for i in range(1, 6):
    print(f"  Count: {i}")

# While loop
print("\\nWhile loop:")
n = 1
while n <= 5:
    print(f"  n = {n}")
    n += 1

# Loop over a list
print("\\nLoop over list:")
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"  {fruit}")`,
    },
    {
      label: 'Functions',
      code: `# Functions
def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

def is_even(n):
    return n % 2 == 0

# Call the functions
print(greet("Alice"))
print(f"5 + 3 = {add(5, 3)}")
print(f"Is 4 even? {is_even(4)}")
print(f"Is 7 even? {is_even(7)}")`,
    },
    {
      label: 'Arrays / Lists',
      code: `# Lists in Python
numbers = [5, 2, 8, 1, 9, 3]

print("Original:", numbers)
print("Length:", len(numbers))
print("First:", numbers[0])
print("Last:", numbers[-1])

# Add and remove
numbers.append(7)
print("After append:", numbers)

numbers.remove(2)
print("After remove(2):", numbers)

# Sort
numbers.sort()
print("Sorted:", numbers)

# List comprehension
squares = [x**2 for x in range(1, 6)]
print("Squares:", squares)`,
    },
    {
      label: 'Classes & Objects',
      code: `# Classes & Objects
class Student:
    def __init__(self, name, age, grade):
        self.name = name
        self.age = age
        self.grade = grade

    def introduce(self):
        return f"Hi, I'm {self.name}, age {self.age}."

    def is_passing(self):
        return self.grade >= 75

    def __str__(self):
        return f"Student({self.name}, {self.grade})"

# Create objects
s1 = Student("Alice", 20, 88)
s2 = Student("Bob", 19, 65)

print(s1.introduce())
print(f"{s1.name} passing: {s1.is_passing()}")
print(f"{s2.name} passing: {s2.is_passing()}")
print(s1)`,
    },
  ],

  java: [
    {
      label: 'Hello World',
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to StudyPY!");
    }
}`,
    },
    {
      label: 'Variables & Data Types',
      code: `public class Main {
    public static void main(String[] args) {
        String name = "Alice";
        int age = 20;
        double gpa = 3.85;
        boolean isEnrolled = true;

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("GPA: " + gpa);
        System.out.println("Enrolled: " + isEnrolled);
    }
}`,
    },
    {
      label: 'If/Else Conditions',
      code: `public class Main {
    public static void main(String[] args) {
        int grade = 85;

        if (grade >= 90) {
            System.out.println("A - Excellent!");
        } else if (grade >= 80) {
            System.out.println("B - Good job!");
        } else if (grade >= 70) {
            System.out.println("C - Passing");
        } else if (grade >= 60) {
            System.out.println("D - Needs improvement");
        } else {
            System.out.println("F - Failed");
        }
    }
}`,
    },
    {
      label: 'Loops',
      code: `public class Main {
    public static void main(String[] args) {
        // For loop
        System.out.println("For loop:");
        for (int i = 1; i <= 5; i++) {
            System.out.println("  Count: " + i);
        }

        // While loop
        System.out.println("\\nWhile loop:");
        int n = 1;
        while (n <= 5) {
            System.out.println("  n = " + n);
            n++;
        }

        // For-each loop
        System.out.println("\\nFor-each loop:");
        String[] fruits = {"apple", "banana", "cherry"};
        for (String fruit : fruits) {
            System.out.println("  " + fruit);
        }
    }
}`,
    },
    {
      label: 'Functions',
      code: `public class Main {
    static String greet(String name) {
        return "Hello, " + name + "!";
    }

    static int add(int a, int b) {
        return a + b;
    }

    static boolean isEven(int n) {
        return n % 2 == 0;
    }

    public static void main(String[] args) {
        System.out.println(greet("Alice"));
        System.out.println("5 + 3 = " + add(5, 3));
        System.out.println("Is 4 even? " + isEven(4));
        System.out.println("Is 7 even? " + isEven(7));
    }
}`,
    },
    {
      label: 'Arrays / Lists',
      code: `import java.util.Arrays;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        // Array
        int[] numbers = {5, 2, 8, 1, 9, 3};
        System.out.println("Array: " + Arrays.toString(numbers));
        System.out.println("Length: " + numbers.length);

        Arrays.sort(numbers);
        System.out.println("Sorted: " + Arrays.toString(numbers));

        // ArrayList
        ArrayList<String> fruits = new ArrayList<>();
        fruits.add("apple");
        fruits.add("banana");
        fruits.add("cherry");
        System.out.println("ArrayList: " + fruits);
        fruits.remove("banana");
        System.out.println("After remove: " + fruits);
    }
}`,
    },
    {
      label: 'Classes & Objects',
      code: `public class Main {
    static class Student {
        String name;
        int age;
        int grade;

        Student(String name, int age, int grade) {
            this.name = name;
            this.age = age;
            this.grade = grade;
        }

        String introduce() {
            return "Hi, I'm " + name + ", age " + age + ".";
        }

        boolean isPassing() {
            return grade >= 75;
        }

        public String toString() {
            return "Student(" + name + ", " + grade + ")";
        }
    }

    public static void main(String[] args) {
        Student s1 = new Student("Alice", 20, 88);
        Student s2 = new Student("Bob", 19, 65);

        System.out.println(s1.introduce());
        System.out.println(s1.name + " passing: " + s1.isPassing());
        System.out.println(s2.name + " passing: " + s2.isPassing());
        System.out.println(s1);
    }
}`,
    },
  ],

  cpp: [
    {
      label: 'Hello World',
      code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "Welcome to StudyPY!" << endl;
    return 0;
}`,
    },
    {
      label: 'Variables & Data Types',
      code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Alice";
    int age = 20;
    double gpa = 3.85;
    bool isEnrolled = true;

    cout << "Name: " << name << endl;
    cout << "Age: " << age << endl;
    cout << "GPA: " << gpa << endl;
    cout << "Enrolled: " << isEnrolled << endl;
    return 0;
}`,
    },
    {
      label: 'If/Else Conditions',
      code: `#include <iostream>
using namespace std;

int main() {
    int grade = 85;

    if (grade >= 90) {
        cout << "A - Excellent!" << endl;
    } else if (grade >= 80) {
        cout << "B - Good job!" << endl;
    } else if (grade >= 70) {
        cout << "C - Passing" << endl;
    } else if (grade >= 60) {
        cout << "D - Needs improvement" << endl;
    } else {
        cout << "F - Failed" << endl;
    }
    return 0;
}`,
    },
    {
      label: 'Loops',
      code: `#include <iostream>
using namespace std;

int main() {
    // For loop
    cout << "For loop:" << endl;
    for (int i = 1; i <= 5; i++) {
        cout << "  Count: " << i << endl;
    }

    // While loop
    cout << "\\nWhile loop:" << endl;
    int n = 1;
    while (n <= 5) {
        cout << "  n = " << n << endl;
        n++;
    }

    // Do-while loop
    cout << "\\nDo-while loop:" << endl;
    int x = 1;
    do {
        cout << "  x = " << x << endl;
        x++;
    } while (x <= 3);

    return 0;
}`,
    },
    {
      label: 'Functions',
      code: `#include <iostream>
#include <string>
using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int add(int a, int b) {
    return a + b;
}

bool isEven(int n) {
    return n % 2 == 0;
}

int main() {
    cout << greet("Alice") << endl;
    cout << "5 + 3 = " << add(5, 3) << endl;
    cout << "Is 4 even? " << isEven(4) << endl;
    cout << "Is 7 even? " << isEven(7) << endl;
    return 0;
}`,
    },
    {
      label: 'Arrays / Lists',
      code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Array
    int arr[] = {5, 2, 8, 1, 9, 3};
    int size = sizeof(arr) / sizeof(arr[0]);

    cout << "Array: ";
    for (int i = 0; i < size; i++) cout << arr[i] << " ";
    cout << endl;

    // Vector
    vector<int> nums = {5, 2, 8, 1, 9, 3};
    sort(nums.begin(), nums.end());

    cout << "Sorted vector: ";
    for (int n : nums) cout << n << " ";
    cout << endl;

    nums.push_back(7);
    cout << "After push_back(7): ";
    for (int n : nums) cout << n << " ";
    cout << endl;

    return 0;
}`,
    },
    {
      label: 'Classes & Objects',
      code: `#include <iostream>
#include <string>
using namespace std;

class Student {
public:
    string name;
    int age;
    int grade;

    Student(string n, int a, int g) {
        name = n;
        age = a;
        grade = g;
    }

    string introduce() {
        return "Hi, I'm " + name + ", age " + to_string(age) + ".";
    }

    bool isPassing() {
        return grade >= 75;
    }
};

int main() {
    Student s1("Alice", 20, 88);
    Student s2("Bob", 19, 65);

    cout << s1.introduce() << endl;
    cout << s1.name << " passing: " << s1.isPassing() << endl;
    cout << s2.name << " passing: " << s2.isPassing() << endl;
    return 0;
}`,
    },
  ],

  javascript: [
    {
      label: 'Hello World',
      code: `// Hello World
console.log("Hello, World!");
console.log("Welcome to StudyPY!");`,
    },
    {
      label: 'Variables & Data Types',
      code: `// Variables & Data Types
const name = "Alice";      // string
let age = 20;              // number
const gpa = 3.85;          // number
let isEnrolled = true;     // boolean

console.log("Name:", name);
console.log("Age:", age);
console.log("GPA:", gpa);
console.log("Enrolled:", isEnrolled);
console.log("Type of age:", typeof age);`,
    },
    {
      label: 'If/Else Conditions',
      code: `// If/Else Conditions
const grade = 85;

if (grade >= 90) {
    console.log("A - Excellent!");
} else if (grade >= 80) {
    console.log("B - Good job!");
} else if (grade >= 70) {
    console.log("C - Passing");
} else if (grade >= 60) {
    console.log("D - Needs improvement");
} else {
    console.log("F - Failed");
}`,
    },
    {
      label: 'Loops',
      code: `// For loop
console.log("For loop:");
for (let i = 1; i <= 5; i++) {
    console.log("  Count:", i);
}

// While loop
console.log("\\nWhile loop:");
let n = 1;
while (n <= 5) {
    console.log("  n =", n);
    n++;
}

// For-of loop
console.log("\\nFor-of loop:");
const fruits = ["apple", "banana", "cherry"];
for (const fruit of fruits) {
    console.log(" ", fruit);
}`,
    },
    {
      label: 'Functions',
      code: `// Functions
function greet(name) {
    return \`Hello, \${name}!\`;
}

const add = (a, b) => a + b;

const isEven = (n) => n % 2 === 0;

console.log(greet("Alice"));
console.log("5 + 3 =", add(5, 3));
console.log("Is 4 even?", isEven(4));
console.log("Is 7 even?", isEven(7));`,
    },
    {
      label: 'Arrays / Lists',
      code: `// Arrays
const numbers = [5, 2, 8, 1, 9, 3];

console.log("Original:", numbers);
console.log("Length:", numbers.length);
console.log("First:", numbers[0]);
console.log("Last:", numbers[numbers.length - 1]);

numbers.push(7);
console.log("After push:", numbers);

numbers.splice(numbers.indexOf(2), 1);
console.log("After removing 2:", numbers);

const sorted = [...numbers].sort((a, b) => a - b);
console.log("Sorted:", sorted);

const squares = [1,2,3,4,5].map(x => x ** 2);
console.log("Squares:", squares);`,
    },
    {
      label: 'Classes & Objects',
      code: `// Classes & Objects
class Student {
    constructor(name, age, grade) {
        this.name = name;
        this.age = age;
        this.grade = grade;
    }

    introduce() {
        return \`Hi, I'm \${this.name}, age \${this.age}.\`;
    }

    isPassing() {
        return this.grade >= 75;
    }

    toString() {
        return \`Student(\${this.name}, \${this.grade})\`;
    }
}

const s1 = new Student("Alice", 20, 88);
const s2 = new Student("Bob", 19, 65);

console.log(s1.introduce());
console.log(\`\${s1.name} passing: \${s1.isPassing()}\`);
console.log(\`\${s2.name} passing: \${s2.isPassing()}\`);
console.log(s1.toString());`,
    },
  ],

  php: [
    {
      label: 'Hello World',
      code: `<?php
echo "Hello, World!\\n";
echo "Welcome to StudyPY!\\n";
?>`,
    },
    {
      label: 'Variables & Data Types',
      code: `<?php
$name = "Alice";        // string
$age = 20;              // integer
$gpa = 3.85;            // float
$isEnrolled = true;     // boolean

echo "Name: $name\\n";
echo "Age: $age\\n";
echo "GPA: $gpa\\n";
echo "Enrolled: " . ($isEnrolled ? "true" : "false") . "\\n";
echo "Type of age: " . gettype($age) . "\\n";
?>`,
    },
    {
      label: 'If/Else Conditions',
      code: `<?php
$grade = 85;

if ($grade >= 90) {
    echo "A - Excellent!\\n";
} elseif ($grade >= 80) {
    echo "B - Good job!\\n";
} elseif ($grade >= 70) {
    echo "C - Passing\\n";
} elseif ($grade >= 60) {
    echo "D - Needs improvement\\n";
} else {
    echo "F - Failed\\n";
}
?>`,
    },
    {
      label: 'Loops',
      code: `<?php
// For loop
echo "For loop:\\n";
for ($i = 1; $i <= 5; $i++) {
    echo "  Count: $i\\n";
}

// While loop
echo "\\nWhile loop:\\n";
$n = 1;
while ($n <= 5) {
    echo "  n = $n\\n";
    $n++;
}

// Foreach loop
echo "\\nForeach loop:\\n";
$fruits = ["apple", "banana", "cherry"];
foreach ($fruits as $fruit) {
    echo "  $fruit\\n";
}
?>`,
    },
    {
      label: 'Functions',
      code: `<?php
function greet($name) {
    return "Hello, $name!";
}

function add($a, $b) {
    return $a + $b;
}

function isEven($n) {
    return $n % 2 === 0;
}

echo greet("Alice") . "\\n";
echo "5 + 3 = " . add(5, 3) . "\\n";
echo "Is 4 even? " . (isEven(4) ? "true" : "false") . "\\n";
echo "Is 7 even? " . (isEven(7) ? "true" : "false") . "\\n";
?>`,
    },
    {
      label: 'Arrays / Lists',
      code: `<?php
$numbers = [5, 2, 8, 1, 9, 3];

echo "Original: " . implode(", ", $numbers) . "\\n";
echo "Length: " . count($numbers) . "\\n";
echo "First: " . $numbers[0] . "\\n";

array_push($numbers, 7);
echo "After push: " . implode(", ", $numbers) . "\\n";

sort($numbers);
echo "Sorted: " . implode(", ", $numbers) . "\\n";

$squares = array_map(fn($x) => $x ** 2, [1, 2, 3, 4, 5]);
echo "Squares: " . implode(", ", $squares) . "\\n";
?>`,
    },
    {
      label: 'Classes & Objects',
      code: `<?php
class Student {
    public $name;
    public $age;
    public $grade;

    public function __construct($name, $age, $grade) {
        $this->name = $name;
        $this->age = $age;
        $this->grade = $grade;
    }

    public function introduce() {
        return "Hi, I'm {$this->name}, age {$this->age}.";
    }

    public function isPassing() {
        return $this->grade >= 75;
    }

    public function __toString() {
        return "Student({$this->name}, {$this->grade})";
    }
}

$s1 = new Student("Alice", 20, 88);
$s2 = new Student("Bob", 19, 65);

echo $s1->introduce() . "\\n";
echo $s1->name . " passing: " . ($s1->isPassing() ? "true" : "false") . "\\n";
echo $s2->name . " passing: " . ($s2->isPassing() ? "true" : "false") . "\\n";
echo $s1 . "\\n";
?>`,
    },
  ],
};

function initExamples(containerId, language) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const examples = EXAMPLES[language];
  if (!examples) return;

  // Build the examples panel
  container.innerHTML = `
    <div class="sp-examples">
      <div class="sp-examples__label">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 4h12M2 8h8M2 12h10" stroke-linecap="round"/>
        </svg>
        Examples
      </div>
      <div class="sp-examples__cards">
        ${examples.map((ex, i) => `
          <button class="sp-example-card" data-index="${i}">
            ${ex.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Click handler — loads example into the compiler
  container.querySelectorAll('.sp-example-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      const example = examples[index];
      if (!example) return;

      // Find the CodeMirror editor or textarea
      const compilerEl = document.querySelector('.sp-compiler');
      if (!compilerEl) return;

      // Try CodeMirror first
      const cmEditor = compilerEl.querySelector('.cm-editor');
      if (cmEditor && window.__cmViews) {
        const view = window.__cmViews[compilerEl.id];
        if (view) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: example.code }
          });
        }
      } else {
        // Fallback: plain textarea
        const ta = compilerEl.querySelector('.sp-compiler__textarea');
        if (ta) ta.value = example.code;
      }

      // Highlight active card
      container.querySelectorAll('.sp-example-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}
