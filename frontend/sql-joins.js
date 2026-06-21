/**
 * StudyPy SQL Join Visualizer
 * Dynamic client-side engine to simulate relational database joins and highlight Venn diagram regions
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Selectors
    const cards = document.querySelectorAll('.join-type-card');
    const vennLeft = document.getElementById('venn-left');
    const vennMiddle = document.getElementById('venn-middle');
    const vennRight = document.getElementById('venn-right');
    const sqlQueryDisplay = document.getElementById('sql-query-display');
    const copySqlBtn = document.getElementById('copy-sql-btn');
    const resultsTable = document.getElementById('sql-results-table');
    const resultsHead = resultsTable ? resultsTable.querySelector('thead') : null;
    const resultsBody = resultsTable ? resultsTable.querySelector('tbody') : null;

    // Hardcoded datasets for demonstration
    const tableA = [
        { id: 1, name: 'Alice', dept_id: 10 },
        { id: 2, name: 'Bob', dept_id: 20 },
        { id: 3, name: 'Charlie', dept_id: 30 },
        { id: 4, name: 'David', dept_id: null }
    ];

    const tableB = [
        { id: 10, name: 'Engineering' },
        { id: 20, name: 'Marketing' },
        { id: 40, name: 'Sales' }
    ];

    // SQL Templates mapping
    const SQL_TEMPLATES = {
        inner: `SELECT 
    e.id AS emp_id, 
    e.name AS emp_name, 
    d.id AS dept_id, 
    d.name AS dept_name
FROM Employees e
INNER JOIN Departments d 
    ON e.dept_id = d.id;`,

        left: `SELECT 
    e.id AS emp_id, 
    e.name AS emp_name, 
    d.id AS dept_id, 
    d.name AS dept_name
FROM Employees e
LEFT JOIN Departments d 
    ON e.dept_id = d.id;`,

        right: `SELECT 
    e.id AS emp_id, 
    e.name AS emp_name, 
    d.id AS dept_id, 
    d.name AS dept_name
FROM Employees e
RIGHT JOIN Departments d 
    ON e.dept_id = d.id;`,

        full: `SELECT 
    e.id AS emp_id, 
    e.name AS emp_name, 
    d.id AS dept_id, 
    d.name AS dept_name
FROM Employees e
FULL OUTER JOIN Departments d 
    ON e.dept_id = d.id;`,

        'left-excluding': `SELECT 
    e.id AS emp_id, 
    e.name AS emp_name, 
    d.id AS dept_id, 
    d.name AS dept_name
FROM Employees e
LEFT JOIN Departments d 
    ON e.dept_id = d.id
WHERE d.id IS NULL;`,

        'right-excluding': `SELECT 
    e.id AS emp_id, 
    e.name AS emp_name, 
    d.id AS dept_id, 
    d.name AS dept_name
FROM Employees e
RIGHT JOIN Departments d 
    ON e.dept_id = d.id
WHERE e.dept_id IS NULL;`
    };

    function highlightSql(sql) {
        const keywords = [
            'SELECT', 'FROM', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
            'FULL OUTER JOIN', 'ON', 'WHERE', 'IS NULL', 'AS', 'AND'
        ];
        let html = sql;
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            html = html.replace(regex, `<span class="sql-keyword">${keyword}</span>`);
        });
        
        // Highlight aliases (e., d.)
        html = html.replace(/\b(e|d)\./g, `<span class="sql-alias">$1</span>.`);
        // Highlight NULL values
        html = html.replace(/\bNULL\b/g, `<span class="sql-null">NULL</span>`);
        return html;
    }

    function computeJoinResult(type) {
        const results = [];
        
        if (type === 'inner') {
            tableA.forEach(e => {
                const d = tableB.find(dep => dep.id === e.dept_id);
                if (d) {
                    results.push({ emp_id: e.id, emp_name: e.name, dept_id: d.id, dept_name: d.name });
                }
            });
        } else if (type === 'left') {
            tableA.forEach(e => {
                const d = tableB.find(dep => dep.id === e.dept_id);
                if (d) {
                    results.push({ emp_id: e.id, emp_name: e.name, dept_id: d.id, dept_name: d.name });
                } else {
                    results.push({ emp_id: e.id, emp_name: e.name, dept_id: 'NULL', dept_name: 'NULL' });
                }
            });
        } else if (type === 'right') {
            tableB.forEach(d => {
                const matches = tableA.filter(e => e.dept_id === d.id);
                if (matches.length > 0) {
                    matches.forEach(e => {
                        results.push({ emp_id: e.id, emp_name: e.name, dept_id: d.id, dept_name: d.name });
                    });
                } else {
                    results.push({ emp_id: 'NULL', emp_name: 'NULL', dept_id: d.id, dept_name: d.name });
                }
            });
        } else if (type === 'full') {
            const matchedBIds = new Set();
            tableA.forEach(e => {
                const d = tableB.find(dep => dep.id === e.dept_id);
                if (d) {
                    results.push({ emp_id: e.id, emp_name: e.name, dept_id: d.id, dept_name: d.name });
                    matchedBIds.add(d.id);
                } else {
                    results.push({ emp_id: e.id, emp_name: e.name, dept_id: 'NULL', dept_name: 'NULL' });
                }
            });
            tableB.forEach(d => {
                if (!matchedBIds.has(d.id)) {
                    results.push({ emp_id: 'NULL', emp_name: 'NULL', dept_id: d.id, dept_name: d.name });
                }
            });
        } else if (type === 'left-excluding') {
            tableA.forEach(e => {
                const d = tableB.find(dep => dep.id === e.dept_id);
                if (!d) {
                    results.push({ emp_id: e.id, emp_name: e.name, dept_id: 'NULL', dept_name: 'NULL' });
                }
            });
        } else if (type === 'right-excluding') {
            tableB.forEach(d => {
                const matched = tableA.some(e => e.dept_id === d.id);
                if (!matched) {
                    results.push({ emp_id: 'NULL', emp_name: 'NULL', dept_id: d.id, dept_name: d.name });
                }
            });
        }
        
        return results;
    }

    function renderResultsTable(rows) {
        if (!resultsHead || !resultsBody) return;
        
        // Headers
        resultsHead.innerHTML = `
            <tr>
                <th>emp_id</th>
                <th>emp_name</th>
                <th>dept_id</th>
                <th>dept_name</th>
            </tr>
        `;
        
        // Body
        if (rows.length === 0) {
            resultsBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: rgba(255,255,255,0.4);">No rows returned</td></tr>`;
            return;
        }

        resultsBody.innerHTML = rows.map(row => {
            const empIdClass = row.emp_id === 'NULL' ? 'cell-null' : '';
            const empNameClass = row.emp_name === 'NULL' ? 'cell-null' : '';
            const deptIdClass = row.dept_id === 'NULL' ? 'cell-null' : '';
            const deptNameClass = row.dept_name === 'NULL' ? 'cell-null' : '';

            return `
                <tr>
                    <td class="${empIdClass}">${row.emp_id}</td>
                    <td class="${empNameClass}">${row.emp_name}</td>
                    <td class="${deptIdClass}">${row.dept_id}</td>
                    <td class="${deptNameClass}">${row.dept_name}</td>
                </tr>
            `;
        }).join('');
    }

    function updateVisualizer(joinType) {
        // 1. Update active card in sidebar
        cards.forEach(card => {
            if (card.getAttribute('data-join') === joinType) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // 2. Update Venn Diagram Shading
        if (vennLeft && vennMiddle && vennRight) {
            vennLeft.classList.remove('active');
            vennMiddle.classList.remove('active');
            vennRight.classList.remove('active');

            if (joinType === 'inner') {
                vennMiddle.classList.add('active');
            } else if (joinType === 'left') {
                vennLeft.classList.add('active');
                vennMiddle.classList.add('active');
            } else if (joinType === 'right') {
                vennMiddle.classList.add('active');
                vennRight.classList.add('active');
            } else if (joinType === 'full') {
                vennLeft.classList.add('active');
                vennMiddle.classList.add('active');
                vennRight.classList.add('active');
            } else if (joinType === 'left-excluding') {
                vennLeft.classList.add('active');
            } else if (joinType === 'right-excluding') {
                vennRight.classList.add('active');
            }
        }

        // 3. Update SQL query with highlights
        if (sqlQueryDisplay) {
            const sqlText = SQL_TEMPLATES[joinType] || '';
            sqlQueryDisplay.innerHTML = highlightSql(sqlText);
        }

        // 4. Compute and Render Live Results
        const rows = computeJoinResult(joinType);
        renderResultsTable(rows);
    }

    // Setup interactive card clicks
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const joinType = card.getAttribute('data-join');
            if (joinType) {
                updateVisualizer(joinType);
            }
        });
    });

    // Copy SQL Clipboard Action
    if (copySqlBtn) {
        copySqlBtn.addEventListener('click', () => {
            const activeCard = document.querySelector('.join-type-card.active');
            const joinType = activeCard ? activeCard.getAttribute('data-join') : 'inner';
            const sqlText = SQL_TEMPLATES[joinType] || '';
            
            navigator.clipboard.writeText(sqlText).then(() => {
                const originalText = copySqlBtn.innerHTML;
                copySqlBtn.innerHTML = '<i class="bx bx-check"></i> Copied!';
                setTimeout(() => {
                    copySqlBtn.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy SQL text: ', err);
            });
        });
    }

    // Default initialization
    updateVisualizer('inner');
});
