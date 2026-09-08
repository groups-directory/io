"use strict";


const state = {

    groups: [],

    category: "الكل",

    platform: "all",

    search: ""

};


const elements = {

    grid: document.getElementById("groupsGrid"),

    loading: document.getElementById("loading"),

    empty: document.getElementById("emptyState"),

    search: document.getElementById("searchInput"),

    clearSearch: document.getElementById("clearSearch"),

    resultsText: document.getElementById("resultsText"),

    totalGroups: document.getElementById("totalGroups"),

    totalCategories: document.getElementById("totalCategories"),

    sort: document.getElementById("sortSelect"),

    reset: document.getElementById("resetFilters"),

    mobileMenu: document.getElementById("mobileMenu"),

    mobileNav: document.getElementById("mobileNav"),

    year: document.getElementById("year")

};


document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    elements.year.textContent =
        new Date().getFullYear();


    setupEvents();


    try {

        const response =
            await fetch(
                "grops/groups.json",
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "groups.json not found"
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid groups.json"
            );

        }


        state.groups = data;


        updateStats();


        render();


    } catch (error) {

        console.error(error);


        state.groups = [];


        elements.loading
            .classList
            .add("hidden");


        showError();

    }

}


function setupEvents() {


    elements.search.addEventListener(
        "input",
        () => {

            state.search =
                elements.search.value.trim();


            elements.clearSearch
                .classList
                .toggle(
                    "visible",
                    state.search.length > 0
                );


            render();

        }
    );


    elements.clearSearch.addEventListener(
        "click",
        () => {

            elements.search.value = "";

            state.search = "";

            elements.clearSearch
                .classList
                .remove("visible");

            elements.search.focus();

            render();

        }
    );


    elements.sort.addEventListener(
        "change",
        render
    );


    elements.reset.addEventListener(
        "click",
        resetFilters
    );


    elements.mobileMenu.addEventListener(
        "click",
        () => {

            elements.mobileNav
                .classList
                .toggle("open");

        }
    );


    document
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.category =
                        button.dataset.category;


                    updateCategoryUI();


                    elements.mobileNav
                        .classList
                        .remove("open");


                    render();

                }
            );

        });


    document
        .querySelectorAll(
            "[data-platform]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.platform =
                        button.dataset.platform;


                    document
                        .querySelectorAll(
                            "[data-platform]"
                        )
                        .forEach(btn =>
                            btn.classList.remove(
                                "active"
                            )
                        );


                    button.classList.add(
                        "active"
                    );


                    render();

                }
            );

        });

}


function updateCategoryUI() {

    document
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                state.category
            );

        });

}


function getFilteredGroups() {

    let result =
        [...state.groups];


    if (state.category !== "الكل") {

        result =
            result.filter(group => {

                if (
                    Array.isArray(
                        group.categories
                    )
                ) {

                    return group.categories
                        .includes(
                            state.category
                        );

                }


                return group.category ===
                    state.category;

            });

    }


    if (state.platform !== "all") {

        result =
            result.filter(group =>

                normalize(
                    group.platform
                ) ===
                normalize(
                    state.platform
                )

            );

    }


    if (state.search) {

        const search =
            normalize(
                state.search
            );


        result =
            result.filter(group => {

                const content = [

                    group.name,

                    group.description,

                    group.category,

                    ...(group.categories || []),

                    group.platform

                ]
                .filter(Boolean)
                .join(" ");


                return normalize(
                    content
                ).includes(search);

            });

    }


    if (
        elements.sort.value ===
        "name"
    ) {

        result.sort(
            (a, b) =>

                String(a.name || "")
                    .localeCompare(
                        String(b.name || ""),
                        "ar"
                    )

        );

    }


    return result;

}


function render() {

    const groups =
        getFilteredGroups();


    elements.loading
        .classList
        .add("hidden");


    elements.grid.innerHTML = "";


    if (!groups.length) {

        elements.empty
            .classList
            .remove("hidden");


        elements.resultsText.textContent =
            "لا توجد نتائج";


        return;

    }


    elements.empty
        .classList
        .add("hidden");


    elements.resultsText.textContent =
        `عرض ${groups.length} من ${state.groups.length} جروب`;


    const fragment =
        document.createDocumentFragment();


    groups.forEach(group => {

        fragment.appendChild(
            createCard(group)
        );

    });


    elements.grid.appendChild(
        fragment
    );

}


function createCard(group) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "group-card";


    const imageWrap =
        document.createElement(
            "div"
        );


    imageWrap.className =
        "card-image-wrap";


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "card-image";


    image.loading =
        "lazy";


    image.decoding =
        "async";


    image.alt =
        group.name ||
        "صورة الجروب";


    image.src =
        group.image || "";


    image.onerror =
        () => {

            image.src =
                "https://i.ibb.co/vC5gz7jj/1788902907258.png";

        };


    const platform =
        document.createElement(
            "div"
        );


    platform.className =
        "platform-badge";


    platform.textContent =
        getPlatformName(
            group.platform
        );


    imageWrap.appendChild(
        image
    );


    imageWrap.appendChild(
        platform
    );


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "card-content";


    const category =
        document.createElement(
            "div"
        );


    category.className =
        "card-category";


    category.textContent =

        Array.isArray(
            group.categories
        )

        ? group.categories.join(" · ")

        : group.category ||
          "عام";


    const title =
        document.createElement(
            "h3"
        );


    title.className =
        "card-title";


    title.textContent =
        group.name ||
        "جروب بدون اسم";


    const description =
        document.createElement(
            "p"
        );


    description.className =
        "card-description";


    description.textContent =

        group.description ||
        "انضم إلى هذا المجتمع واكتشف المزيد.";


    const footer =
        document.createElement(
            "div"
        );


    footer.className =
        "card-footer";


    const date =
        document.createElement(
            "span"
        );


    date.className =
        "card-date";


    date.textContent =

        group.date

        ? `أضيف في ${group.date}`

        : "مجتمع عربي";


    const join =
        document.createElement(
            "a"
        );


    join.className =
        "join-btn";


    join.textContent =
        "دخول الجروب";


    join.href =
        group.link || "#";


    join.target =
        "_blank";


    join.rel =
        "noopener noreferrer";


    footer.appendChild(
        date
    );


    footer.appendChild(
        join
    );


    content.appendChild(
        category
    );


    content.appendChild(
        title
    );


    content.appendChild(
        description
    );


    content.appendChild(
        footer
    );


    article.appendChild(
        imageWrap
    );


    article.appendChild(
        content
    );


    return article;

}


function getPlatformName(
    platform
) {

    switch (
        normalize(platform)
    ) {

        case "telegram":
            return "Telegram";

        case "whatsapp":
            return "WhatsApp";

        case "facebook":
            return "Facebook";

        default:
            return platform ||
                "Community";

    }

}


function normalize(
    value
) {

    return String(
        value || ""
    )
    .toLowerCase()
    .trim()
    .replace(
        /[\u064B-\u065F\u0670]/g,
        ""
    )
    .replace(
        /ى/g,
        "ي"
    )
    .replace(
        /ة/g,
        "ه"
    );

}


function updateStats() {

    elements.totalGroups.textContent =
        state.groups.length;


    const categories =
        new Set();


    state.groups.forEach(
        group => {

            if (
                Array.isArray(
                    group.categories
                )
            ) {

                group.categories.forEach(
                    category =>
                        categories.add(
                            category
                        )
                );

            }

            else if (
                group.category
            ) {

                categories.add(
                    group.category
                );

            }

        }
    );


    elements.totalCategories.textContent =
        categories.size;

}


function resetFilters() {

    state.category =
        "الكل";

    state.platform =
        "all";

    state.search =
        "";


    elements.search.value =
        "";


    elements.clearSearch
        .classList
        .remove("visible");


    elements.sort.value =
        "default";


    document
        .querySelectorAll(
            "[data-platform]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.platform ===
                "all"
            );

        });


    updateCategoryUI();


    render();

}


function showError() {

    elements.empty
        .classList
        .remove("hidden");


    elements.empty
        .querySelector("h3")
        .textContent =
        "تعذر تحميل الجروبات";


    elements.empty
        .querySelector("p")
        .textContent =
        "تأكد من وجود الملف grops/groups.json على الاستضافة.";

}
