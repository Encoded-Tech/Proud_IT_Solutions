import React from "react";
import Image from "next/image";
import Link from "next/link";
import RegisterForm from "./register-form";

const RegisterPage = async () => {
  return (
    <main className="max-w-7xl md:mx-auto mx-2">
      <section className="grid lg:grid-cols-2">
        <div>
          <figure className="lg:block hidden">
            <Image
              src="https://images.unsplash.com/photo-1593344484962-796055d4a3a4?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="login-dummy-img"
              width={1000}
              height={1000}
              className="  h-full object-cover"
            />
          </figure>
        </div>
        <div className="flex items-center justify-center bg-gray-50 min-h-screen ">
          <div className="w-full max-w-md space-y-4 my-4">
        <Link href="/">
              <Image
                src="/logo/logomain.png"
                alt="logo"
                width={1000}
                height={1000}
                className="object-contain w-24 mx-auto mb-4"
              />
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Join us today and get started
              </p>
            </div>
            <RegisterForm />
          </div>
        </div>
        <div></div>
      </section>
    </main>
  );
};

export default RegisterPage;
