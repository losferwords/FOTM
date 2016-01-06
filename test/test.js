describe('angularjs homepage todo list', function() {
    it('should add a todo', function() {
        browser.get('https://46.229.143.69:25016');

        element(by.model('username')).sendKeys('losfer');
        element(by.model('password')).sendKeys('Glor2609findel');
        element(by.css('[type="submit"]')).click();

        var todoList = element.all(by.repeater('todo in todoList.todos'));
        expect(todoList.count()).toEqual(3);
        expect(todoList.get(2).getText()).toEqual('write first protractor test');

        // You wrote your first test, cross it off the list
        todoList.get(2).element(by.css('input')).click();
        var completedAmount = element.all(by.css('.done-true'));
        expect(completedAmount.count()).toEqual(2);
    });
});