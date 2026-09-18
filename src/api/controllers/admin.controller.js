const adminService = require('../../services/admin.service');

function evaluateExpression(formula) {
    if (typeof formula === 'number' && Number.isFinite(formula)) {
        return formula;
    }
    if (typeof formula !== 'string') {
        throw new Error('Invalid formula');
    }
    if (!/^[0-9+\-*/%().\s]+$/.test(formula)) {
        throw new Error('Invalid characters in formula');
    }

    let pos = 0;
    const str = formula;

    function skipWhitespace() {
        while (pos < str.length && /\s/.test(str[pos])) {
            pos++;
        }
    }

    function parseAddSub() {
        let left = parseMulDiv();
        skipWhitespace();
        while (pos < str.length && (str[pos] === '+' || str[pos] === '-')) {
            const op = str[pos++];
            const right = parseMulDiv();
            if (op === '+') left += right;
            else left -= right;
            skipWhitespace();
        }
        return left;
    }

    function parseMulDiv() {
        let left = parsePrimary();
        skipWhitespace();
        while (pos < str.length && (str[pos] === '*' || str[pos] === '/' || str[pos] === '%')) {
            const op = str[pos++];
            const right = parsePrimary();
            if (op === '*') {
                left *= right;
            } else if (op === '/') {
                if (right === 0) throw new Error('Division by zero');
                left /= right;
            } else {
                if (right === 0) throw new Error('Division by zero');
                left %= right;
            }
            skipWhitespace();
        }
        return left;
    }

    function parsePrimary() {
        skipWhitespace();
        if (pos >= str.length) {
            throw new Error('Unexpected end of expression');
        }

        if (str[pos] === '+') {
            pos++;
            return parsePrimary();
        }
        if (str[pos] === '-') {
            pos++;
            return -parsePrimary();
        }

        if (str[pos] === '(') {
            pos++;
            const result = parseAddSub();
            skipWhitespace();
            if (pos >= str.length || str[pos] !== ')') {
                throw new Error('Missing closing parenthesis');
            }
            pos++;
            return result;
        }

        const start = pos;
        let hasDot = false;
        while (pos < str.length && (/[0-9]/.test(str[pos]) || str[pos] === '.')) {
            if (str[pos] === '.') {
                if (hasDot) throw new Error('Invalid number format');
                hasDot = true;
            }
            pos++;
        }

        if (start === pos) {
            throw new Error(`Unexpected character at ${pos}: ${str[pos]}`);
        }

        const numStr = str.slice(start, pos);
        const val = Number(numStr);
        if (isNaN(val)) {
            throw new Error('Invalid number');
        }
        return val;
    }

    skipWhitespace();
    if (pos >= str.length) {
        throw new Error('Empty formula');
    }
    const result = parseAddSub();
    skipWhitespace();
    if (pos < str.length) {
        throw new Error(`Unexpected character at ${pos}: ${str[pos]}`);
    }
    if (!Number.isFinite(result)) {
        throw new Error('Evaluation result is not finite');
    }
    return result;
}

exports.checkShippingStatus = (req, res) => {
    adminService.pingProvider(req.body.providerIP, req.body.options, out => res.send(out));
};

exports.previewDynamicPricing = (req, res) => {
    try {
        res.json({ price: evaluateExpression(req.body.formula) });
    } catch (e) {
        res.status(400).send("Evaluation Failed");
    }
};
