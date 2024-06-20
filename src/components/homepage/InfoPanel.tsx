"use client";

import { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import DoctorExperience from "./images/DoctorExperience.png";
import PatientExperience from "./images/PatientExperience.png";
import Onboarding from "./images/onboarding.png";

export default function Features() {
  const [tab, setTab] = useState<number>(1);

  const tabs = useRef<HTMLDivElement>(null);

  const heightFix = () => {
    if (tabs.current?.parentElement) tabs.current.parentElement.style.height = `${tabs.current.clientHeight}px`;
  };

  useEffect(() => {
    heightFix();
  }, []);

  return (
    <section className="relative">
      {/* Section background (needs .relative class on parent and next sibling elements) */}
      <div className="pointer-events-none absolute inset-0 mb-0 bg-gray-100" aria-hidden="true"></div>
      <div className="absolute left-0 right-0 m-auto h-20 w-px -translate-y-1/2 transform bg-gray-200 p-px"></div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-12 md:pt-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
            <h1 className="leading-tighter mb-4 text-xl font-extrabold tracking-tighter md:text-4xl" data-aos="zoom-y-out">
              One Audience,
              <br /> <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">Two Curated Experiences</span>
            </h1>
          </div>

          {/* Section content */}
          <div className="md:grid md:grid-cols-12 md:gap-6">
            {/* Content */}
            <div className="mx-auto max-w-xl md:col-span-7 md:mt-6 md:w-full md:max-w-none lg:col-span-6" data-aos="fade-right">
              <div className="mb-8 md:pr-4 lg:pr-12 xl:pr-16">
                <h3 className="h3 mb-3 text-3xl">Create and Save Your Profile</h3>
                <p className="text-xl text-gray-600">
                  When a new user signs up, they are brought to an onboarding page where they&apos;ll choose their profile type, either doctor or patient, and
                  add in their user data.
                </p>
              </div>
              {/* Tabs buttons */}
              <div className="mb-8 md:mb-0">
                <a
                  className={`mb-3 flex items-center rounded border p-5 text-lg transition duration-300 ease-in-out ${tab !== 1 ? "border-gray-200 bg-white shadow-md hover:shadow-lg" : "border-transparent bg-gray-200"}`}
                  href="#0"
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(1);
                  }}
                >
                  <div>
                    <div className="mb-1 font-bold leading-snug tracking-tight">Onboard</div>
                    <div className="text-gray-600">
                      Add in user details to register as a user. Information is saved to your database and a user profile is created for future logins.
                    </div>
                  </div>
                </a>
                <a
                  className={`mb-3 flex items-center rounded border p-5 text-lg transition duration-300 ease-in-out ${tab !== 2 ? "border-gray-200 bg-white shadow-md hover:shadow-lg" : "border-transparent bg-gray-200"}`}
                  href="#0"
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(2);
                  }}
                >
                  <div>
                    <div className="mb-1 font-bold leading-snug tracking-tight">Patient Portal</div>
                    <div className="text-gray-600">As a patient, users can create and edit their profile, upload PDF files, and search for doctors</div>
                  </div>
                </a>
                <a
                  className={`mb-3 flex items-center rounded border p-5 text-lg transition duration-300 ease-in-out ${tab !== 3 ? "border-gray-200 bg-white shadow-md hover:shadow-lg" : "border-transparent bg-gray-200"}`}
                  href="#0"
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(3);
                  }}
                >
                  <div>
                    <div className="mb-1 font-bold leading-snug tracking-tight">Doctor Portal</div>
                    <div className="text-gray-600">Doctors have access to features such as SOAP-compliant notes and in-call access to patient files.</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Tabs items */}
            <div className="mx-auto mb-8 max-w-xl md:order-1 md:col-span-5 md:mb-0 md:w-full md:max-w-none lg:col-span-6">
              <div className="transition-all">
                <div className="relative flex flex-col text-center lg:text-right" data-aos="zoom-y-out" ref={tabs}>
                  {/* Item 1 */}
                  <Transition
                    show={tab === 1}
                    appear={true}
                    // className="w-full"
                    enter="transition ease-in-out duration-700 transform order-first"
                    enterFrom="opacity-0 translate-y-16"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in-out duration-300 transform absolute"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-16"
                    beforeEnter={() => heightFix()}
                    unmount={false}
                  >
                    <div className="relative inline-flex flex-col">
                      {/* <Image className="md:max-w-none mx-auto rounded" src={FeaturesBg} width={500} height="462" alt="Features bg" /> */}
                      <Image
                        className="animate-float absolute left-0 w-full transform md:max-w-none"
                        src={Onboarding}
                        width={500}
                        height="44"
                        alt="Element"
                        style={{ top: "30%" }}
                      />
                    </div>
                  </Transition>
                  {/* Item 2 */}
                  <Transition
                    show={tab === 2}
                    appear={true}
                    // className="w-full"
                    enter="transition ease-in-out duration-700 transform order-first"
                    enterFrom="opacity-0 translate-y-16"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in-out duration-300 transform absolute"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-16"
                    beforeEnter={() => heightFix()}
                    unmount={false}
                  >
                    <div className="relative inline-flex flex-col">
                      {/* <Image className="md:max-w-none mx-auto rounded" src={FeaturesBg} width={500} height="462" alt="Features bg" /> */}
                      <Image
                        className="animate-float absolute left-0 w-full transform md:max-w-none"
                        src={PatientExperience}
                        width={500}
                        height="44"
                        alt="Element"
                        style={{ top: "30%" }}
                      />
                    </div>
                  </Transition>
                  {/* Item 3 */}
                  <Transition
                    show={tab === 3}
                    appear={true}
                    // className="w-full"
                    enter="transition ease-in-out duration-700 transform order-first"
                    enterFrom="opacity-0 translate-y-16"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in-out duration-300 transform absolute"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-16"
                    beforeEnter={() => heightFix()}
                    unmount={false}
                  >
                    <div className="relative inline-flex flex-col">
                      <Image
                        className="animate-float absolute left-0 w-full transform md:max-w-none"
                        src={DoctorExperience}
                        width={500}
                        height="44"
                        alt="Element"
                        style={{ top: "30%" }}
                      />
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
