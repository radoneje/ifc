// firebase_subscribe.js
firebase.initializeApp({
    messagingSenderId: '970751093432'
});
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then(function (registration) {
            return registration.scope;
        })
        .catch(function (err) {
            return err;
        });
}
// браузер поддерживает уведомления
// вообще, эту проверку должна делать библиотека Firebase, но она этого не делает
if ('Notification' in window) {
    var messaging = firebase.messaging();

    // пользователь уже разрешил получение уведомлений
    // подписываем на уведомления если ещё не подписали
    if (Notification.permission != 'granted') {
        subscribe();
    }




    // по клику, запрашиваем у пользователя разрешение на уведомления
    // и подписываем его

   /* $('#subscribe').on('click', function () {
        subscribe();
    });*/
}

async function subscribe() {
    try {
        await messaging.requestPermission();
        let currToken = await messaging.getToken();
        if (currToken) {
            await sendTokenToServer(currToken);
        }
    }
    catch (e){
        console.warn(e);
    }
    /*
    // запрашиваем разрешение на получение уведомлений
    messaging.requestPermission()
        .then(function () {
            // получаем ID устройства
            messaging.getToken()
                .then(async function (currentToken) {
                    console.log(currentToken);

                    if (currentToken) {
                        await sendTokenToServer(currentToken);
                    } else {
                        console.warn('Не удалось получить токен.');
                        setTokenSentToServer(false);
                    }
                })
                .catch(function (err) {
                    console.warn('При получении токена произошла ошибка.', err);
                    setTokenSentToServer(false);
                });
        })
        .catch(function (err) {
            console.warn('Не удалось получить разрешение на показ уведомлений.', err);
        });*/
}

// отправка ID на сервер
async function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer(currentToken)) {
        console.log('Отправка токена на сервер...');

        var url = '/personal/googleToken'; // адрес скрипта на сервере который сохраняет ID устройства
        /*$.post(url, {
            token: currentToken
        });*/
        let r=await postJson(url, {googleToken: currentToken} )

        setTokenSentToServer(currentToken);
    } else {
        console.log('Токен уже отправлен на сервер.');
    }
}

// используем localStorage для отметки того,
// что пользователь уже подписался на уведомления
function isTokenSentToServer(currentToken) {
    return window.localStorage.getItem('sentFirebaseMessagingToken') == currentToken;
}

function setTokenSentToServer(currentToken) {
    window.localStorage.setItem(
        'sentFirebaseMessagingToken',
        currentToken ? currentToken : ''
    );
}
