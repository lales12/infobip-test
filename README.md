## Improvements
Add docker file for the backend and frontend. This helps to avoid the installation of the dependencies and makes the deployment easier also helps to share node version.

### Frontend
Standardize all the code style with prettier and eslint. The code is not consistent with the code style. Some files use semicolons and others don't. Some files use single quotes and others double quotes.

Avoid add business logic in the components. The components should be used only for rendering the UI. The business logic should be in the services or hooks. In order to avoid spread logic between the components, the logic should be in the services or hooks. This helps to avoid code duplication and makes the code more maintainable.

Use the context and the router from react instead use the window.location.href this improve the usability and reduce the load for the servers avoiding the full page reload.

Use more class definitions for bring more consistency.

Avoid use fixed variables for values that can be changed. For example, the `SERVER_URL` is a fixed value. This value should be in a configuration file or in the backend. This helps to avoid hardcode values and makes the code more maintainable. Use REACT_APP_ prefix for environment variables.

Add CSRF token for the requests. This helps to avoid CSRF attacks this will be very usefull for the send email code.

#### src/components/providers/WalletProvider.js
useEffect from the local storage item public key and private key don't work as expected. The use effect should be used for state variables. These use effect only will be triggered when load the page. No as expected when the local storage is updated.

#### src/utils/wallet.js

Avoid use fixed seed for the wallet. This seed should be generated randomly. This helps to avoid security issues. On the logging page we can exchange the seed to improve the security.

#### Fixes
The problems with the register page was the invitation code, when the user 
updated this although remove the values, this values was sent as empty string instead the default value 0. I keep this behavior to avoid breaking the current functionality on the backend side.

### Backend

My mayor concern is the security of the stored wallet key in plain text. This is a security issue. The wallet key should be encrypted. This helps to avoid security issues. The wallet key should be encrypted and decrypted when is needed. This helps to avoid security issues. This can be encrypted with master key stored in the environment variables (if I was using AWS I would use the KMS service).

The database env variable was wrong. The correct variable is `DB_HOST` instead of `HOST`.

#### Infrastructure
One thing that I really miss is a container for dependency injection for the services. This helps to avoid the hardcode of the dependencies and makes the code more maintainable. This also helps to avoid the spread of the dependencies and makes the code more testable.

Other pattern than I miss is some cqrs and ports and adapters pattern. The CQRS helps split the uses cases and keep the use case self contained. I the other hand if we apply the ports and adapters patterns help to have separate the business logic from the infrastructure logic avoiding the coupling between the business logic and the infrastructure logic.
