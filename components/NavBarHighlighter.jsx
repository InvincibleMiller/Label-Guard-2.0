"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function NavBarHighlighter() {
  const routerPathName = usePathname();

  const classes = "active text-light text-opacity-100";
  const classArr = classes.split(" ");

  function updateLinks() {
    const links = document.querySelectorAll(".nav-link");

    links.forEach((link) => {
      classArr.forEach((className) => {
        link.classList.remove(className);
      });

      console.log(routerPathName);

      if (link.getAttribute("href") === routerPathName) {
        classArr.forEach((className) => {
          link.classList.add(className);
        });
      }
    });
  }
  useEffect(() => {
    updateLinks();
  }, [routerPathName]);
  return null;
}

export default NavBarHighlighter;
