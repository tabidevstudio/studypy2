/**
 * StudyPy Data Structures & Algorithms (DSA) Visualizer
 * Dynamic asynchronous sorting and linear structures memory simulation engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Tab Mode Selector Logic
    // -------------------------------------------------------------
    const btnModeSorting = document.getElementById('btn-mode-sorting');
    const btnModeLinear = document.getElementById('btn-mode-linear');
    const sectionSorting = document.getElementById('section-sorting');
    const sectionLinear = document.getElementById('section-linear');

    function switchMode(mode) {
        if (mode === 'sorting') {
            btnModeSorting.classList.add('active');
            btnModeLinear.classList.remove('active');
            sectionSorting.classList.add('active');
            sectionLinear.classList.remove('active');
            // Re-render arrays
            generateRandomArray();
        } else {
            btnModeSorting.classList.remove('active');
            btnModeLinear.classList.add('active');
            sectionSorting.classList.remove('active');
            sectionLinear.classList.add('active');
            // Stop sorting loop & Re-render stack/queue
            stopSortingFlag = true;
            renderLinear();
        }
    }

    if (btnModeSorting) btnModeSorting.addEventListener('click', () => switchMode('sorting'));
    if (btnModeLinear) btnModeLinear.addEventListener('click', () => switchMode('linear'));


    // -------------------------------------------------------------
    // Sorting Algorithms Visualizer Engine
    // -------------------------------------------------------------
    const barsContainer = document.getElementById('sorting-bars-container');
    const selectAlgorithm = document.getElementById('sort-algorithm');
    const sliderSize = document.getElementById('sort-size');
    const sliderSpeed = document.getElementById('sort-speed');
    const btnGenerate = document.getElementById('btn-generate-array');
    const btnStartSort = document.getElementById('btn-start-sort');
    const lblSortName = document.getElementById('sorting-name-lbl');
    const lblSortDesc = document.getElementById('sorting-desc-lbl');

    let sortingArray = [];
    let isSortingRunning = false;
    let stopSortingFlag = false;

    const ALGO_DETAILS = {
        bubble: {
            name: "Bubble Sort",
            desc: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Time Complexity: O(n²)."
        },
        selection: {
            name: "Selection Sort",
            desc: "Repeatedly finds the minimum element from the unsorted part and swaps it to the beginning. Time Complexity: O(n²)."
        },
        insertion: {
            name: "Insertion Sort",
            desc: "Builds the final sorted array one item at a time by inserting each element into its proper position. Time Complexity: O(n²), Best: O(n)."
        }
    };

    if (selectAlgorithm) {
        selectAlgorithm.addEventListener('change', (e) => {
            const val = e.target.value;
            if (ALGO_DETAILS[val]) {
                lblSortName.textContent = ALGO_DETAILS[val].name;
                lblSortDesc.textContent = ALGO_DETAILS[val].desc;
            }
        });
    }

    function generateRandomArray() {
        if (isSortingRunning) {
            stopSortingFlag = true;
        }
        sortingArray = [];
        const size = parseInt(sliderSize.value) || 25;
        for (let i = 0; i < size; i++) {
            // Random values between 5 and 95 (for percentage heights)
            sortingArray.push(Math.floor(Math.random() * 90) + 7);
        }
        drawBars();
    }

    function drawBars(highlightIndices = {}, colorClass = '') {
        if (!barsContainer) return;
        barsContainer.innerHTML = '';
        const size = sortingArray.length;
        
        sortingArray.forEach((val, idx) => {
            const bar = document.createElement('div');
            bar.className = 'sorting-bar';
            bar.style.height = `${val}%`;
            // Calculate width dynamically
            bar.style.width = `calc(${100 / size}% - 4px)`;

            // Highlight compared/swapped nodes
            if (highlightIndices[idx] !== undefined) {
                bar.classList.add(highlightIndices[idx]);
            }

            // Render value overlay if bars are reasonably wide
            if (size <= 25) {
                const label = document.createElement('span');
                label.className = 'bar-value';
                label.textContent = val;
                bar.appendChild(label);
            }

            barsContainer.appendChild(bar);
        });
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getAnimationSpeed() {
        // Higher slider value means more delay, but users slide it for speed.
        // We set range min=10, max=600.
        return parseInt(sliderSpeed.value) || 100;
    }

    function disableControls(disabled) {
        isSortingRunning = disabled;
        if (selectAlgorithm) selectAlgorithm.disabled = disabled;
        if (sliderSize) sliderSize.disabled = disabled;
        if (btnGenerate) btnGenerate.disabled = disabled;
        if (btnStartSort) {
            btnStartSort.disabled = disabled;
            btnStartSort.innerHTML = disabled ? "<i class='bx bx-loader-alt bx-spin'></i> Sorting..." : "<i class='bx bx-play'></i> Sort";
        }
    }

    // A. Bubble Sort Implementation
    async function bubbleSort() {
        const arr = sortingArray;
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (stopSortingFlag) return;

                // Highlight compared indices
                drawBars({ [j]: 'comparing', [j + 1]: 'comparing' });
                await sleep(getAnimationSpeed());

                if (arr[j] > arr[j + 1]) {
                    // Swap values
                    const temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;

                    // Highlight swapped indices
                    drawBars({ [j]: 'swapping', [j + 1]: 'swapping' });
                    await sleep(getAnimationSpeed());
                }
            }
            // Mark sorted boundaries from right to left
            const sortedBoundary = {};
            for (let k = n - i - 1; k < n; k++) {
                sortedBoundary[k] = 'sorted';
            }
            drawBars(sortedBoundary);
        }
        // Complete sort highlights
        const finalSorted = {};
        for (let k = 0; k < n; k++) finalSorted[k] = 'sorted';
        drawBars(finalSorted);
    }

    // B. Selection Sort Implementation
    async function selectionSort() {
        const arr = sortingArray;
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (stopSortingFlag) return;

                // Highlight scan comparisons
                const highlight = { [j]: 'comparing', [minIdx]: 'comparing-min' };
                // Keep previously sorted items styled
                for (let k = 0; k < i; k++) highlight[k] = 'sorted';
                drawBars(highlight);
                await sleep(getAnimationSpeed());

                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }

            if (minIdx !== i) {
                // Swap values
                const temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;

                // Highlight swapping step
                const swapHighlight = { [i]: 'swapping', [minIdx]: 'swapping' };
                for (let k = 0; k < i; k++) swapHighlight[k] = 'sorted';
                drawBars(swapHighlight);
                await sleep(getAnimationSpeed());
            }
        }
        const finalSorted = {};
        for (let k = 0; k < n; k++) finalSorted[k] = 'sorted';
        drawBars(finalSorted);
    }

    // C. Insertion Sort Implementation
    async function insertionSort() {
        const arr = sortingArray;
        const n = arr.length;
        
        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;

            // Highlight current key element
            const keyHighlight = { [i]: 'comparing-min' };
            for (let k = 0; k < i; k++) keyHighlight[k] = 'sorted';
            drawBars(keyHighlight);
            await sleep(getAnimationSpeed());

            while (j >= 0 && arr[j] > key) {
                if (stopSortingFlag) return;

                arr[j + 1] = arr[j];
                
                // Highlight shifting elements
                const shiftHighlight = { [j]: 'comparing', [j + 1]: 'swapping' };
                for (let k = 0; k < i; k++) {
                    if (k !== j && k !== j + 1) shiftHighlight[k] = 'sorted';
                }
                drawBars(shiftHighlight);
                await sleep(getAnimationSpeed());

                j = j - 1;
            }
            arr[j + 1] = key;

            const endStepHighlight = { [j + 1]: 'sorted' };
            for (let k = 0; k <= i; k++) endStepHighlight[k] = 'sorted';
            drawBars(endStepHighlight);
            await sleep(getAnimationSpeed());
        }
        const finalSorted = {};
        for (let k = 0; k < n; k++) finalSorted[k] = 'sorted';
        drawBars(finalSorted);
    }

    // Bind Sorting Button Clicks
    if (btnGenerate) btnGenerate.addEventListener('click', generateRandomArray);
    if (sliderSize) sliderSize.addEventListener('input', generateRandomArray);

    if (btnStartSort) {
        btnStartSort.addEventListener('click', async () => {
            if (isSortingRunning) return;
            disableControls(true);
            stopSortingFlag = false;

            const algo = selectAlgorithm.value;
            if (algo === 'bubble') {
                await bubbleSort();
            } else if (algo === 'selection') {
                await selectionSort();
            } else if (algo === 'insertion') {
                await insertionSort();
            }

            disableControls(false);
        });
    }


    // -------------------------------------------------------------
    // Linear Data Structures (Stack & Queue) Engine
    // -------------------------------------------------------------
    const btnStackMode = document.getElementById('linear-mode-stack');
    const btnQueueMode = document.getElementById('linear-mode-queue');
    const inputVal = document.getElementById('linear-value-input');
    const btnPush = document.getElementById('btn-linear-push');
    const btnPop = document.getElementById('btn-linear-pop');
    const linearContainer = document.getElementById('linear-elements-container');
    const lblLinearTitle = document.getElementById('linear-title-lbl');
    const lblLinearName = document.getElementById('linear-name-lbl');
    const lblLinearDesc = document.getElementById('linear-desc-lbl');

    let linearData = [25, 40, 15, 60];
    let linearMode = 'stack'; // 'stack' or 'queue'

    const LINEAR_DETAILS = {
        stack: {
            title: "Stack Representation",
            name: "Stack (LIFO)",
            desc: "A Last-In-First-Out linear structure. Elements are pushed onto the top and popped off the top. Push: O(1), Pop: O(1).",
            btnPushText: "Push",
            btnPopText: "Pop"
        },
        queue: {
            title: "Queue Representation",
            name: "Queue (FIFO)",
            desc: "A First-In-First-Out linear structure. Elements are enqueued at the rear and dequeued from the front. Enqueue: O(1), Dequeue: O(1).",
            btnPushText: "Enqueue",
            btnPopText: "Dequeue"
        }
    };

    function updateLinearMode(mode) {
        linearMode = mode;
        if (mode === 'stack') {
            btnStackMode.classList.add('active');
            btnQueueMode.classList.remove('active');
        } else {
            btnStackMode.classList.remove('active');
            btnQueueMode.classList.add('active');
        }

        // Update Text labels
        const details = LINEAR_DETAILS[mode];
        if (lblLinearTitle) lblLinearTitle.textContent = details.title;
        if (lblLinearName) lblLinearName.textContent = details.name;
        if (lblLinearDesc) lblLinearDesc.textContent = details.desc;
        if (btnPush) btnPush.textContent = details.btnPushText;
        if (btnPop) btnPop.textContent = details.btnPopText;

        renderLinear();
    }

    if (btnStackMode) btnStackMode.addEventListener('click', () => updateLinearMode('stack'));
    if (btnQueueMode) btnQueueMode.addEventListener('click', () => updateLinearMode('queue'));

    function renderLinear() {
        if (!linearContainer) return;
        linearContainer.innerHTML = '';

        // Apply visual layout structure classes
        const mainCanvas = document.getElementById('linear-canvas');
        if (mainCanvas) {
            if (linearMode === 'stack') {
                mainCanvas.className = "dsa-canvas-container linear-container-wrapper stack-mode";
                linearContainer.className = "linear-visual-track stack-layout";
            } else {
                mainCanvas.className = "dsa-canvas-container linear-container-wrapper queue-mode";
                linearContainer.className = "linear-visual-track queue-layout";
            }
        }

        if (linearData.length === 0) {
            linearContainer.innerHTML = `<div class="empty-linear-msg">Container is empty</div>`;
            return;
        }

        linearData.forEach((val, idx) => {
            const blockWrap = document.createElement('div');
            blockWrap.className = 'linear-block-wrap';

            // Element node block
            const block = document.createElement('div');
            block.className = 'linear-block';
            block.textContent = val;
            
            // Pointer label indicator
            const pointer = document.createElement('div');
            pointer.className = 'linear-pointer';

            if (linearMode === 'stack') {
                // Stack LIFO: Top is at the last element (idx === length - 1)
                if (idx === linearData.length - 1) {
                    pointer.innerHTML = `<i class='bx bx-right-arrow-alt'></i> TOP`;
                    pointer.classList.add('top-ptr');
                } else {
                    pointer.innerHTML = '&nbsp;';
                }
            } else {
                // Queue FIFO: Front at index 0, Rear at last index
                const ptrs = [];
                if (idx === 0) {
                    ptrs.push(`FRONT`);
                }
                if (idx === linearData.length - 1) {
                    ptrs.push(`REAR`);
                }
                if (ptrs.length > 0) {
                    pointer.innerHTML = ptrs.join(' &amp; ') + ` <i class='bx bx-down-arrow-alt'></i>`;
                    pointer.classList.add('queue-ptr');
                } else {
                    pointer.innerHTML = '&nbsp;';
                }
            }

            blockWrap.appendChild(pointer);
            blockWrap.appendChild(block);
            linearContainer.appendChild(blockWrap);
        });
    }

    if (btnPush) {
        btnPush.addEventListener('click', () => {
            let val = inputVal.value.trim();
            if (!val) {
                // Generate random numeric code
                val = Math.floor(Math.random() * 90) + 10;
            }

            // Cap items at 8 to keep layout responsive
            if (linearData.length >= 8) {
                alert("Simulator container size limit reached (Max 8 elements)!");
                return;
            }

            linearData.push(val);
            inputVal.value = '';
            renderLinear();

            // Apply quick bounce transition on the top node
            const elements = linearContainer.querySelectorAll('.linear-block-wrap');
            if (elements.length > 0) {
                const targetNode = elements[elements.length - 1];
                targetNode.classList.add('entering');
            }
        });
    }

    if (btnPop) {
        btnPop.addEventListener('click', () => {
            if (linearData.length === 0) {
                alert("Underflow error: Container is already empty!");
                return;
            }

            const elements = linearContainer.querySelectorAll('.linear-block-wrap');
            let popIdx = linearMode === 'stack' ? linearData.length - 1 : 0;
            
            if (elements.length > 0 && elements[popIdx]) {
                const targetNode = elements[popIdx];
                targetNode.classList.add('leaving');
                
                // Delay array adjustment slightly to complete the CSS fade/leaving animation
                setTimeout(() => {
                    if (linearMode === 'stack') {
                        linearData.pop();
                    } else {
                        linearData.shift();
                    }
                    renderLinear();
                }, 250);
            }
        });
    }

    // Initial default triggers
    generateRandomArray();
});
