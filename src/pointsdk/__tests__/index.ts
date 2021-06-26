import point from '../';

describe('Poin SDK', () => {
    test('has correct structure', () => {
        expect(point).toHaveProperty('contract');
        expect(point).toHaveProperty('wallet');
        expect(point).toHaveProperty('storage');
    });
});
