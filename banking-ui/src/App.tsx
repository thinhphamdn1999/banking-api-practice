import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	useAuth,
	UserButton
} from '@clerk/clerk-react';
import { useEffect } from 'react';

import './App.css';

function App() {
	const { getToken } = useAuth();

	useEffect(() => {
		const fetchToken = async () => {
			const token = await getToken();
			console.log('Clerk Token:', token);
		};

		fetchToken();
	}, [getToken]);

	return (
		<>
			<header>
				{/* Show the sign-in and sign-up buttons when the user is signed out */}
				<SignedOut>
					<SignInButton />
					<SignUpButton />
				</SignedOut>
				{/* Show the user button when the user is signed in */}
				<SignedIn>
					<UserButton />
				</SignedIn>
			</header>
		</>
	);
}

export default App;
