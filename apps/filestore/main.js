import('helma/webapp', 'webapp');
import('model');

export('index');

// the main action is invoked for http://localhost:8080/
// this also shows simple skin rendering
function index(req, res) {
    if (req.params.save) {
        createBook(req, res);
    }
    if (req.params.remove) {
        removeBook(req, res);
    }
    res.render('skins/index.html', {
        title: 'Storage Demo',
        books: function(/*tag, skin, context*/) {
            var books = model.Book.all();
            return books.map(function(book) {
                return book.getFullTitle() + ' ' + getDeleteLink(book);
            }).join('<br>\r\n');
        }
    });
}

function createBook(req, res) {
    var author = new model.Author({name: req.params.author});
    var book = new model.Book({author: author, title: req.params.title});
    // author is saved transitively
    book.save();
    res.redirect('/');
}

function removeBook(req, res) {
    var book = model.Book.get(req.params.remove);
    // author is removed through cascading delete
    book.remove();
    res.redirect('/');
}

function getDeleteLink(book) {
    return '<a href="/?remove=' + book._id + '">delete</a>';
}

if (__name__ == "__main__") {
    webapp.start();
}
