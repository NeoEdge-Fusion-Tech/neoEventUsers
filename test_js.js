const events = [{'id': '08d259ea-d1ce-48a4-94c0-91bda9822a55', 'category': '1cb63930-38a4-4a2f-9e10-93ff56b8f39f'}];
const categories = [{'id': '1cb63930-38a4-4a2f-9e10-93ff56b8f39f'}];
const matches = events.filter(e => e.category === categories[0].id);
console.log("Matches:", matches.length);
