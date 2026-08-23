import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;
const sourceRoot = path.resolve('src');

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(js|jsx)$/.test(entry.name) ? [target] : [];
  });
}

function elementName(node) {
  return node?.name?.type === 'JSXIdentifier' ? node.name.name : null;
}

function attributes(node) {
  return new Map(
    node.attributes
      .filter((attribute) => attribute.type === 'JSXAttribute')
      .map((attribute) => [attribute.name.name, attribute.value])
  );
}

function literalValue(value) {
  if (!value) return true;
  if (value.type === 'StringLiteral') return value.value;
  if (value.type === 'JSXExpressionContainer' && value.expression.type === 'StringLiteral') {
    return value.expression.value;
  }
  return null;
}

const issues = [];
let controls = 0;

for (const file of sourceFiles(sourceRoot)) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  traverse(ast, {
    JSXOpeningElement(pathNode) {
      const name = elementName(pathNode.node);
      if (!['button', 'form', 'input', 'select', 'textarea'].includes(name)) return;
      controls += 1;

      const attrs = attributes(pathNode.node);
      const location = `${path.relative(process.cwd(), file)}:${pathNode.node.loc.start.line}`;

      if (name === 'button') {
        const type = literalValue(attrs.get('type'));
        const submits = type === 'submit' || attrs.has('formAction');
        if (!submits && !attrs.has('onClick')) {
          issues.push(`${location} button has no onClick or submit action`);
        }
      }

      if (name === 'form' && !attrs.has('onSubmit') && !attrs.has('action')) {
        issues.push(`${location} form has no onSubmit or action`);
      }

      if (['input', 'select', 'textarea'].includes(name)) {
        const controlled = attrs.has('value') || attrs.has('checked');
        const immutable = attrs.has('readOnly') || attrs.has('disabled');
        if (controlled && !immutable && !attrs.has('onChange')) {
          issues.push(`${location} controlled ${name} has no onChange`);
        }
      }
    },
  });
}

if (issues.length > 0) {
  console.error(`Interaction verification failed (${issues.length} issue(s)):`);
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`Interaction verification passed (${controls} controls inspected).`);
