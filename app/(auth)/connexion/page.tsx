import { LoginForm } from './login-form';

export const metadata = { title: 'Connexion' };

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { next, error } = await searchParams;
  return <LoginForm next={next} initialError={error} />;
}
