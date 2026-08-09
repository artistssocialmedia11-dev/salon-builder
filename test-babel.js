import { parse } from '@babel/parser';

const code = `
function comp() {
  return (
    <section>
      { true && (
        <div>
      )}
    </section>
  );
}
`;

try {
  parse(code, { plugins: ['jsx'] });
  console.log('Passed');
} catch (e) {
  console.log('Error:', e.message);
}
