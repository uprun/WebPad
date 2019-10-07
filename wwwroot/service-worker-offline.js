self.addEventListener('install', event => {
    console.log('V1 installing…');
    event.waitUntil(
        caches.open('v1').then(function(cache) {
          return cache.addAll([
            'svg/plus.svg'
          ]);
        })
      );
  });
  
  self.addEventListener('activate', event => {
    console.log('V1 now ready to handle fetches!');
  });


  self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
      // caches.match() always resolves
      // but in case of success response will have value
      if (response !== undefined) {
        return response;
      } else {
        return fetch(event.request).then(function (response) {
          // response may be used only once
          // we need to save clone to put one copy in cache
          // and serve second one
          let responseClone = response.clone();
          
          if(event.request.method !== "POST")
          {
            caches.open('v1').then(function (cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        }).catch(function () {
          return caches.match('/svg/plus.svg');
        });
      }
    }));
  });