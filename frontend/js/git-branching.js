/**
 * StudyPy Git Branching Simulator
 * Dynamic, educational client-side Git visualization engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-history');
    const svgCanvas = document.getElementById('git-svg-canvas');
    const svgEdges = document.getElementById('git-edges');
    const svgNodes = document.getElementById('git-nodes');
    const svgLabels = document.getElementById('git-labels');
    const quickCmdButtons = document.querySelectorAll('.quick-cmd-btn');

    // State Variables
    let commits = {
        'c0': {
            id: 'c0',
            message: 'Initial commit',
            parents: [],
            branch: 'main',
            depth: 0,
            x: 60,
            y: 160
        }
    };
    let branches = {
        'main': 'c0'
    };
    let head = 'main'; // Points to the branch name 'main' (e.g. checked out to branch)
    let commitCount = 1;
    let branchTracks = { 'main': 0 };
    let branchColors = { 'main': '#2ecc71' };

    // Track allocation helpers
    const COLOR_PALETTE = ['#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#f1c40f', '#e74c3c'];
    let nextColorIndex = 0;

    function getBranchTrack(branchName) {
        if (branchTracks[branchName] === undefined) {
            const allocated = Object.values(branchTracks);
            let nextTrack = 1;
            while (allocated.includes(nextTrack) || allocated.includes(-nextTrack)) {
                nextTrack++;
            }
            // Alternate sign to keep it balanced
            if (!allocated.includes(nextTrack)) {
                branchTracks[branchName] = nextTrack;
            } else {
                branchTracks[branchName] = -nextTrack;
            }
        }
        return branchTracks[branchName];
    }

    function getBranchColor(branchName) {
        if (branchName === 'main') return '#2ecc71';
        if (branchName.startsWith('detached-') || branchName === '(detached)') return '#95a5a6';
        if (!branchColors[branchName]) {
            branchColors[branchName] = COLOR_PALETTE[nextColorIndex % COLOR_PALETTE.length];
            nextColorIndex++;
        }
        return branchColors[branchName];
    }

    // Terminal Logging Helper
    function appendLog(type, text) {
        if (!terminalBody) return;
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        
        if (type === 'input-cmd') {
            line.innerHTML = `<span class="terminal-prompt">studypy/git $</span> ${escapeHtml(text)}`;
        } else {
            line.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
        }
        
        terminalBody.appendChild(line);
        // Scroll terminal to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Execute mock command
    function executeCommand(cmdText) {
        cmdText = cmdText.trim();
        if (!cmdText) return;

        appendLog('input-cmd', cmdText);

        const tokens = cmdText.split(/\s+/);
        const baseCmd = tokens[0];

        if (baseCmd === 'clear') {
            if (terminalBody) terminalBody.innerHTML = '';
            appendLog('system-msg', 'Terminal cleared.');
        } else if (baseCmd === 'reset') {
            resetRepository();
            appendLog('system-msg', 'Repository reset successfully.');
        } else if (baseCmd === 'help') {
            showHelp();
        } else if (baseCmd === 'git') {
            const gitCmd = tokens[1];
            if (!gitCmd) {
                appendLog('error-msg', 'Usage: git <command> [options]');
                return;
            }

            switch (gitCmd) {
                case 'commit':
                    handleCommit(cmdText, tokens);
                    break;
                case 'branch':
                    handleBranch(tokens);
                    break;
                case 'checkout':
                    handleCheckout(tokens);
                    break;
                case 'merge':
                    handleMerge(tokens);
                    break;
                case 'log':
                    handleLog();
                    break;
                case 'status':
                    handleStatus();
                    break;
                default:
                    appendLog('error-msg', `git: '${gitCmd}' is not a recognized git command. Type "help" to see available commands.`);
            }
        } else {
            appendLog('error-msg', `Command not found: '${baseCmd}'. Type "help" to see available commands.`);
        }

        updateLayoutAndRender();
    }

    // Git Command Handlers
    function handleCommit(cmdText, tokens) {
        // Extract message from -m option if present
        let message = `Commit ${commitCount}`;
        const mIndex = tokens.indexOf('-m');
        
        if (mIndex !== -1 && tokens[mIndex + 1]) {
            // Find everything inside quotes after -m
            const match = cmdText.match(/-m\s+["'](.*?)["']/);
            if (match && match[1]) {
                message = match[1];
            } else {
                // Fallback to taking next token without quotes
                message = tokens.slice(mIndex + 1).join(' ').replace(/["']/g, '');
            }
        }

        // Find active commit ID
        const activeCommitId = getActiveCommitId();
        if (!activeCommitId) {
            appendLog('error-msg', 'Error: Cannot find HEAD commit.');
            return;
        }

        const newId = `c${commitCount}`;
        let activeBranch = getActiveBranch();
        
        // Handle detached HEAD commits
        let commitBranch = activeBranch;
        if (!commitBranch) {
            // Detached commit inherits parent's branch if already detached
            const parentCommit = commits[activeCommitId];
            if (parentCommit && parentCommit.branch.startsWith('detached-')) {
                commitBranch = parentCommit.branch;
            } else {
                commitBranch = `detached-${activeCommitId}`;
            }
            // Ensure Y track allocation
            getBranchTrack(commitBranch);
        }

        // Add the commit node
        commits[newId] = {
            id: newId,
            message: message,
            parents: [activeCommitId],
            branch: commitBranch,
            depth: 0, // Calculated dynamically
            x: 0,
            y: 0
        };

        // Advance branch/head pointers
        if (activeBranch) {
            branches[activeBranch] = newId;
        } else {
            // Detached HEAD moves directly to the new commit ID
            head = newId;
            appendLog('system-msg', `[detached HEAD ${newId}] ${message}`);
        }

        commitCount++;
        appendLog('output-msg', `[${activeBranch || 'detached HEAD'} ${newId}] ${message}`);
    }

    function handleBranch(tokens) {
        if (tokens.length === 2) {
            // git branch (list branches)
            const activeBranch = getActiveBranch();
            
            // Print listing format
            const outputContainer = document.createElement('div');
            outputContainer.className = 'terminal-line output-msg';
            
            // Format nice looking branches text
            const formatted = Object.keys(branches).map(bName => {
                if (bName === activeBranch) {
                    return `<span style="color:#2ecc71; font-weight:bold;">* ${bName}</span>`;
                } else {
                    return `  ${bName}`;
                }
            }).join('<br>');
            
            outputContainer.innerHTML = formatted;
            if (terminalBody) {
                terminalBody.appendChild(outputContainer);
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
            return;
        }

        const branchName = tokens[2];
        if (!branchName) {
            appendLog('error-msg', 'fatal: Branch name required.');
            return;
        }

        if (branches[branchName]) {
            appendLog('error-msg', `fatal: A branch named '${branchName}' already exists.`);
            return;
        }

        // Create branch pointing to active commit
        const activeCommitId = getActiveCommitId();
        branches[branchName] = activeCommitId;
        appendLog('output-msg', `Created branch '${branchName}' pointing to ${activeCommitId}.`);
    }

    function handleCheckout(tokens) {
        const target = tokens[2];
        
        // Check for checkout -b
        if (target === '-b') {
            const newBranchName = tokens[3];
            if (!newBranchName) {
                appendLog('error-msg', 'fatal: Branch name required.');
                return;
            }
            if (branches[newBranchName]) {
                appendLog('error-msg', `fatal: A branch named '${newBranchName}' already exists.`);
                return;
            }
            
            const activeCommitId = getActiveCommitId();
            branches[newBranchName] = activeCommitId;
            head = newBranchName;
            appendLog('output-msg', `Switched to a new branch '${newBranchName}'`);
            return;
        }

        if (!target) {
            appendLog('error-msg', 'fatal: Branch name or commit ID required.');
            return;
        }

        // Try checking out to branch
        if (branches[target]) {
            head = target;
            appendLog('output-msg', `Switched to branch '${target}'`);
            return;
        }

        // Try checking out to commit ID
        if (commits[target]) {
            head = target; // Detached HEAD state
            appendLog('system-msg', `Note: switching to '${target}'.\n\nYou are in 'detached HEAD' state. You can look around, make experimental commits and commit them, and you can discard any commits you make in this state without impacting any branches by performing another checkout.`);
            return;
        }

        appendLog('error-msg', `error: pathspec '${target}' did not match any file(s) known to git.`);
    }

    function handleMerge(tokens) {
        const target = tokens[2];
        if (!target) {
            appendLog('error-msg', 'fatal: Branch or commit to merge is required.');
            return;
        }

        const activeBranch = getActiveBranch();
        if (!activeBranch) {
            appendLog('error-msg', 'fatal: You are not currently on a branch. Merge aborted.');
            return;
        }

        // Resolve target commit
        let targetCommitId = branches[target] || (commits[target] ? target : null);
        if (!targetCommitId) {
            appendLog('error-msg', `merge: ${target} - not something we can merge.`);
            return;
        }

        const currentCommitId = branches[activeBranch];
        if (currentCommitId === targetCommitId) {
            appendLog('output-msg', 'Already up to date.');
            return;
        }

        // Perform ancestor check
        const isTargetAncestor = checkIsAncestor(targetCommitId, currentCommitId);
        if (isTargetAncestor) {
            appendLog('output-msg', 'Already up to date.');
            return;
        }

        const isCurrentAncestor = checkIsAncestor(currentCommitId, targetCommitId);
        if (isCurrentAncestor) {
            // Fast-forward merge
            branches[activeBranch] = targetCommitId;
            appendLog('output-msg', `Fast-forward. Switched ${activeBranch} to ${targetCommitId}.`);
            return;
        }

        // 3-way Merge commit
        const newId = `c${commitCount}`;
        const message = `Merge branch '${target}' into ${activeBranch}`;
        
        commits[newId] = {
            id: newId,
            message: message,
            parents: [currentCommitId, targetCommitId],
            branch: activeBranch,
            depth: 0,
            x: 0,
            y: 0
        };

        branches[activeBranch] = newId;
        commitCount++;
        appendLog('output-msg', `Merge made by the 'recursive' strategy.\n ${newId}: ${message}`);
    }

    function handleLog() {
        const activeCommitId = getActiveCommitId();
        if (!activeCommitId) {
            appendLog('error-msg', 'fatal: No commits yet.');
            return;
        }

        // Traverse backwards from active commit
        const logEntries = [];
        const visited = new Set();
        const queue = [activeCommitId];

        while (queue.length > 0) {
            // Sort to print log chronologically/topologically
            queue.sort((a, b) => {
                const numA = parseInt(a.slice(1));
                const numB = parseInt(b.slice(1));
                return numB - numA; // Descending
            });

            const curr = queue.shift();
            if (visited.has(curr)) continue;
            visited.add(curr);

            const commit = commits[curr];
            logEntries.push(commit);

            commit.parents.forEach(pId => {
                if (commits[pId] && !visited.has(pId)) {
                    queue.push(pId);
                }
            });
        }

        // Render logs
        let logText = '';
        logEntries.forEach(c => {
            // Find references pointing to this commit
            const refs = [];
            if (head === c.id) refs.push('HEAD');
            
            Object.entries(branches).forEach(([bName, bId]) => {
                if (bId === c.id) {
                    if (head === bName) {
                        refs.push(`HEAD -> ${bName}`);
                    } else {
                        refs.push(bName);
                    }
                }
            });

            const refStr = refs.length > 0 ? ` <span style="color:#00e676; font-weight:bold;">(${refs.join(', ')})</span>` : '';
            logText += `<div class="log-commit">commit ${c.id}${refStr}</div>`;
            logText += `<div style="color:#aaa;">Author: Student &lt;student@studypy.org&gt;</div>`;
            logText += `<div style="color:#888; margin-bottom: 4px;">Date: ${new Date().toLocaleDateString()}</div>`;
            logText += `<div style="padding-left: 20px; color:#fff; margin-bottom:12px;">${c.message}</div>`;
        });

        const line = document.createElement('div');
        line.innerHTML = logText;
        if (terminalBody) {
            terminalBody.appendChild(line);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }

    function handleStatus() {
        const activeBranch = getActiveBranch();
        if (activeBranch) {
            appendLog('output-msg', `On branch ${activeBranch}\nYour branch is up to date.\n\nnothing to commit, working tree clean`);
        } else {
            appendLog('output-msg', `HEAD detached at ${head}\nnothing to commit, working tree clean`);
        }
    }

    // Git helper functions
    function getActiveCommitId() {
        if (branches[head]) {
            return branches[head];
        }
        return head; // Detached head is commitId itself
    }

    function getActiveBranch() {
        return branches[head] ? head : null;
    }

    function checkIsAncestor(ancestorId, descendantId) {
        if (ancestorId === descendantId) return true;
        
        const queue = [descendantId];
        const visited = new Set();

        while (queue.length > 0) {
            const curr = queue.shift();
            if (curr === ancestorId) return true;
            
            if (visited.has(curr)) continue;
            visited.add(curr);

            const commit = commits[curr];
            if (commit) {
                commit.parents.forEach(pId => {
                    if (!visited.has(pId)) {
                        queue.push(pId);
                    }
                });
            }
        }
        return false;
    }

    // Layout coordinates calculator
    function updateCoordinates() {
        // Sort commits to compute topologically
        const sortedCommits = Object.values(commits).sort((a, b) => {
            const numA = parseInt(a.id.slice(1));
            const numB = parseInt(b.id.slice(1));
            return numA - numB;
        });

        sortedCommits.forEach(commit => {
            if (commit.parents.length === 0) {
                commit.depth = 0;
            } else {
                const parentDepths = commit.parents.map(pId => commits[pId] ? commits[pId].depth : 0);
                commit.depth = Math.max(...parentDepths) + 1;
            }

            const track = getBranchTrack(commit.branch);
            // X positioning
            commit.x = 60 + commit.depth * 80;
            // Y positioning centered around 160
            commit.y = 160 - track * 55;
        });
    }

    // Render tree nodes, edges, labels
    function renderSvg() {
        if (!svgEdges || !svgNodes || !svgLabels || !svgCanvas) return;

        // Clear previous SVG
        svgEdges.innerHTML = '';
        svgNodes.innerHTML = '';
        svgLabels.innerHTML = '';

        const allCommits = Object.values(commits);
        if (allCommits.length === 0) return;

        // Dynamic resize width
        const maxDepth = Math.max(...allCommits.map(c => c.depth));
        const requiredWidth = 120 + maxDepth * 80;
        const containerWidth = svgCanvas.parentElement.clientWidth;
        svgCanvas.setAttribute('width', Math.max(containerWidth, requiredWidth));

        // Group labels by commit
        const labelsByCommit = {};
        Object.entries(branches).forEach(([bName, cId]) => {
            if (!labelsByCommit[cId]) labelsByCommit[cId] = [];
            labelsByCommit[cId].push({ name: bName, type: 'branch' });
        });

        // Add HEAD label
        const activeCommitId = getActiveCommitId();
        if (activeCommitId) {
            if (!labelsByCommit[activeCommitId]) labelsByCommit[activeCommitId] = [];
            
            const activeBranch = getActiveBranch();
            if (activeBranch) {
                // Stack HEAD pointing to active branch
                labelsByCommit[activeCommitId].push({ name: 'HEAD', type: 'head' });
            } else {
                labelsByCommit[activeCommitId].push({ name: 'HEAD (detached)', type: 'head-detached' });
            }
        }

        // Draw Edges first (so they render behind nodes)
        allCommits.forEach(c => {
            c.parents.forEach((pId, idx) => {
                const parent = commits[pId];
                if (!parent) return;

                const edge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                
                // Curve definition
                let pathD;
                if (parent.y === c.y) {
                    pathD = `M ${parent.x} ${parent.y} L ${c.x} ${c.y}`;
                } else {
                    const cp1x = parent.x + (c.x - parent.x) / 2;
                    const cp1y = parent.y;
                    const cp2x = parent.x + (c.x - parent.x) / 2;
                    const cp2y = c.y;
                    pathD = `M ${parent.x} ${parent.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${c.x} ${c.y}`;
                }

                edge.setAttribute('d', pathD);
                edge.setAttribute('class', idx > 0 ? 'commit-edge merge-edge' : 'commit-edge');
                edge.setAttribute('marker-end', 'url(#arrow)');
                svgEdges.appendChild(edge);
            });
        });

        // Draw Nodes
        allCommits.forEach(c => {
            const color = getBranchColor(c.branch);
            const activeCommitId = getActiveCommitId();
            
            // Circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', c.x);
            circle.setAttribute('cy', c.y);
            circle.setAttribute('r', 10);
            circle.setAttribute('fill', color);
            
            let classStr = 'commit-node';
            if (c.id === activeCommitId) {
                classStr += ' active-commit';
            }
            circle.setAttribute('class', classStr);

            // Interactive clicking on commit node to checkout
            circle.addEventListener('click', () => {
                executeCommand(`git checkout ${c.id}`);
            });

            // SVG title tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${c.id} - ${c.message}\nBranch: ${c.branch}`;
            circle.appendChild(title);
            svgNodes.appendChild(circle);

            // Commit identifier inside/near circle
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', c.x);
            text.setAttribute('y', c.y + 4);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', 'commit-label');
            text.textContent = c.id;
            svgNodes.appendChild(text);
        });

        // Draw Labels (Pointers)
        Object.entries(labelsByCommit).forEach(([cId, labelList]) => {
            const commit = commits[cId];
            if (!commit) return;

            // Sort labels so HEAD is always at the top of the stack
            labelList.sort((a, b) => {
                if (a.type.startsWith('head') && !b.type.startsWith('head')) return -1;
                if (!a.type.startsWith('head') && b.type.startsWith('head')) return 1;
                return a.name.localeCompare(b.name);
            });

            labelList.forEach((lbl, index) => {
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                
                // Styling classes
                let groupClass = 'branch-label-group';
                if (lbl.type === 'head') groupClass += ' head-ptr';
                if (lbl.type === 'head-detached') groupClass += ' head-detached-ptr';
                group.setAttribute('class', groupClass);

                const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                textNode.setAttribute('text-anchor', 'middle');
                textNode.setAttribute('class', 'branch-text');
                textNode.textContent = lbl.name;

                // Position calculation
                const charLen = lbl.name.length;
                const rectW = charLen * 6.5 + 12;
                const rectH = 16;
                const rx = commit.x;
                // Stack above commit
                const ry = commit.y - 22 - index * 20;

                textNode.setAttribute('x', rx);
                textNode.setAttribute('y', ry + 4); // Vertical alignment

                const rectNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rectNode.setAttribute('x', rx - rectW / 2);
                rectNode.setAttribute('y', ry - rectH / 2);
                rectNode.setAttribute('width', rectW);
                rectNode.setAttribute('height', rectH);
                rectNode.setAttribute('class', 'branch-rect');
                
                // Color badges based on type/name
                let rectColor = '#3498db'; // Default feature
                let rectBorder = 'transparent';

                if (lbl.type === 'head') {
                    rectColor = '#34495e';
                    rectBorder = '#bdc3c7';
                } else if (lbl.type === 'head-detached') {
                    rectColor = '#e74c3c';
                    rectBorder = '#fff';
                } else {
                    rectColor = getBranchColor(lbl.name);
                }

                rectNode.setAttribute('fill', rectColor);
                rectNode.setAttribute('stroke', rectBorder);

                group.appendChild(rectNode);
                group.appendChild(textNode);
                svgLabels.appendChild(group);
            });
        });
    }

    function updateLayoutAndRender() {
        updateCoordinates();
        renderSvg();
    }

    // Reset repo
    function resetRepository() {
        commits = {
            'c0': {
                id: 'c0',
                message: 'Initial commit',
                parents: [],
                branch: 'main',
                depth: 0,
                x: 60,
                y: 160
            }
        };
        branches = {
            'main': 'c0'
        };
        head = 'main';
        commitCount = 1;
        branchTracks = { 'main': 0 };
        branchColors = { 'main': '#2ecc71' };
        nextColorIndex = 0;
        
        updateLayoutAndRender();
    }

    // Help
    function showHelp() {
        const helpText = `
<div style="color: #3498db; font-weight: bold; margin-bottom: 6px;">Available commands:</div>
  <code style="color: #2ecc71;">git commit [-m "message"]</code> - Adds a new commit node
  <code style="color: #2ecc71;">git branch [name]</code> - Lists or creates a new branch
  <code style="color: #2ecc71;">git checkout [-b] [name]</code> - Switches branch or creates new one
  <code style="color: #2ecc71;">git merge [branch]</code> - Merges changes into active branch
  <code style="color: #2ecc71;">git log</code> - Prints commit graph logs
  <code style="color: #2ecc71;">git status</code> - Shows repo status
  <code style="color: #2ecc71;">clear</code> - Clears history screen
  <code style="color: #2ecc71;">reset</code> - Reinitializes simulation
  
<div style="color: #e67e22; margin-top: 6px;">💡 Pro-tip: You can click directly on any commit node in the graph to run "git checkout" to that commit!</div>
`;
        const line = document.createElement('div');
        line.innerHTML = helpText;
        if (terminalBody) {
            terminalBody.appendChild(line);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }

    // Setup input listeners
    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value;
                executeCommand(cmd);
                terminalInput.value = '';
            }
        });
    }

    // Quick command buttons
    quickCmdButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            if (cmd) {
                // Focus input and execute
                if (terminalInput) {
                    terminalInput.focus();
                }
                executeCommand(cmd);
            }
        });
    });

    // Window resize handling to scale SVG width
    window.addEventListener('resize', () => {
        renderSvg();
    });

    // Initial setup
    updateLayoutAndRender();
});
