import React from "react";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./login-form";

const LoginPage = async () => {
  return (
    <main className="max-w-7xl md:mx-auto ">
      <section className="grid lg:grid-cols-2">
        <div className="flex items-center justify-center bg-gray-50 min-h-screen py-12 ">
          <div className="w-full max-w-md space-y-8">
            <Link href="/">
              <Image
                src="/logo/mainlogo.png"
                alt="logo"
                width={1000}
                height={1000}
                className="object-contain w-20 mx-auto mb-4"
              />
            </Link>

            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight ">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-gray-900">
                Please sign in to your account
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
        <div>
          <figure className="lg:block hidden">
            <Image
              src="https://images.unsplash.com/photo-1573053986275-840ffc7cc685?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="login-dummy-img"
              width={1000}
              height={1000}
              className=" h-screen object-cover"
            />
          </figure>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
