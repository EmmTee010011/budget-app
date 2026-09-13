const budgetForm = document.getElementById("budgetForm");
const categoryForm = document.getElementById("categoryForm");
const budgetSetupArea = document.getElementById("budgetSetupArea");
const budgetSection = document.getElementById("budgetSection");
const budgetTitle = document.getElementById("budgetTitle");
const displayDate = document.getElementById("displayDate");
const incomeDisplay = document.getElementById("incomeDisplay");
const plannedDisplay = document.getElementById("plannedDisplay");
const balanceDisplay = document.getElementById("balanceDisplay");
const budgetBody = document.getElementById("budgetBody");
const categoryCount = document.getElementById("categoryCount");
const currencySelect = document.getElementById("currency");
const colorPicker = document.getElementById("colorPicker");
const selectedEmoji = document.getElementById("selectedEmoji");
const budgetType = document.getElementById("budgetType");
const monthlyFields = document.getElementById("monthlyFields");
const dateRangeFields = document.getElementById("dateRangeFields");
const newBudgetBtn = document.getElementById("newBudgetBtn");
const cancelBudgetBtn = document.getElementById("cancelBudgetBtn");
const deleteBudgetBtn = document.getElementById("deleteBudgetBtn");

const editModal = document.getElementById("editModal");
const editCategoryForm = document.getElementById("editCategoryForm");
const editCategoryName = document.getElementById("editCategoryName");
const editCategoryAmount = document.getElementById("editCategoryAmount");
const editSelectedEmoji = document.getElementById("editSelectedEmoji");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");

let budgets = [];

let activeBudgetId = null;


// Stores the ID of the category
// currently being edited.
let editingCategoryId = null;

let isCreatingBudget = false;

const DEFAULT_COLOR = "#3F5A52";


function getCurrencySymbol() {

    if (
        currencySelect.value === "USD"
    ) {

        return "$";

    }

    return "₱";

}


function formatMoney(amount) {

    return `${getCurrencySymbol()}${Number(amount).toLocaleString()}`;

}


// ============================================
// BUDGET TYPE
// ============================================

function updateBudgetTypeFields() {

    const isMonthly =
        budgetType.value === "monthly";


    monthlyFields.classList.toggle(
        "hidden",
        !isMonthly
    );


    dateRangeFields.classList.toggle(
        "hidden",
        isMonthly
    );


    const salaryInput =
        document.getElementById("salary");


    if (isMonthly) {

        salaryInput.placeholder =
            "Monthly Income";

    } else {

        salaryInput.placeholder =
            "Income for This Cutoff";

    }

}


// ============================================
// BUDGET TYPE BUTTONS
// ============================================

document
    .querySelectorAll(".budgetTypeBtn")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const selectedType =
                    button.dataset.budgetType;


                budgetType.value =
                    selectedType;


                updateBudgetTypeFields();

                updateBudgetTypeButtons();

            }
        );

    });


function updateBudgetTypeButtons() {

    document
        .querySelectorAll(".budgetTypeBtn")
        .forEach((button) => {

            const isSelected =
                button.dataset.budgetType ===
                budgetType.value;


            if (isSelected) {

                button.classList.remove(
                    "border-transparent",
                    "bg-[#FFF8F3]"
                );


                button.classList.add(
                    "border-[#3F5A52]",
                    "bg-[#E9E1CA]"
                );

            } else {

                button.classList.remove(
                    "border-[#3F5A52]",
                    "bg-[#E9E1CA]"
                );


                button.classList.add(
                    "border-transparent",
                    "bg-[#FFF8F3]"
                );

            }

        });

}


// ============================================
// INITIALIZE BUDGET TYPE
// ============================================

budgetType.addEventListener(
    "change",
    updateBudgetTypeFields
);


updateBudgetTypeFields();

updateBudgetTypeButtons();


// ============================================
// GET ACTIVE BUDGET
// ============================================

function getActiveBudget() {

    return budgets.find(
        (budget) =>
            budget.id === activeBudgetId
    );

}


// ============================================
// GENERATE SAFE ID
// ============================================

function generateId(prefix = "id") {

    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );

}


// ============================================
// SAVE
// ============================================

function saveBudgets() {

    localStorage.setItem(
        "budgets",
        JSON.stringify(budgets)
    );


    localStorage.setItem(
        "activeBudgetId",
        activeBudgetId || ""
    );

}


// ============================================
// SHOW CREATE SCREEN
// ============================================

function showBudgetSetup() {

    budgetSection.classList.add(
        "hidden"
    );


    budgetSetupArea.classList.remove(
        "hidden"
    );


    cancelBudgetBtn.classList.toggle(
        "hidden",
        budgets.length === 0
    );

}


// ============================================
// SHOW BUDGET
// ============================================

function showBudgetView() {

    budgetSetupArea.classList.add(
        "hidden"
    );


    budgetSection.classList.remove(
        "hidden"
    );

}


// ============================================
// BUDGET SELECTOR
// ============================================

function renderBudgetSelector() {

    const selector =
        document.getElementById(
            "budgetSelector"
        );


    selector.innerHTML = "";


    budgets.forEach((budget) => {

        const option =
            document.createElement("option");


        option.value =
            budget.id;


        option.textContent =
            budget.title;


        selector.appendChild(option);

    });


    selector.value =
        activeBudgetId;

}


// ============================================
// RENDER BUDGET
// ============================================

function renderBudget() {

    const budget =
        getActiveBudget();


    if (!budget) {

        return;

    }


    // ========================================
    // RESTORE THIS BUDGET'S COLOR
    // ========================================

    const budgetColor =
        budget.color || DEFAULT_COLOR;


    colorPicker.value =
        budgetColor;


    applyTheme(
        budgetColor
    );


    // ----------------------------------------
    // TITLE
    // ----------------------------------------

    budgetTitle.textContent =
        budget.title;


    // ----------------------------------------
    // DATE
    // ----------------------------------------

    if (
        budget.type === "monthly"
    ) {

        displayDate.textContent =
            budget.month;

    } else {

        displayDate.textContent =
            `${budget.startDate} → ${budget.endDate}`;

    }


    // ----------------------------------------
    // TOTALS
    // ----------------------------------------

    const totalPlanned =
        budget.categories.reduce(
            (total, item) =>
                total + Number(item.amount),
            0
        );


    const remaining =
        Number(budget.income) -
        totalPlanned;


    incomeDisplay.textContent =
        formatMoney(budget.income);


    plannedDisplay.textContent =
        formatMoney(totalPlanned);


    balanceDisplay.textContent =
        formatMoney(remaining);


    // ----------------------------------------
    // CATEGORY COUNT
    // ----------------------------------------

    categoryCount.textContent =
        `${budget.categories.length}`;


    // ----------------------------------------
    // CLEAR CATEGORY LIST
    // ----------------------------------------

    budgetBody.innerHTML = "";


    // ----------------------------------------
    // NO CATEGORIES
    // ----------------------------------------

    if (
        budget.categories.length === 0
    ) {

        budgetBody.innerHTML = `

            <div
                class="rounded-[2rem] bg-white p-8 text-center shadow-sm"
            >

                <div class="mb-3 text-4xl">
                    🐣
                </div>

                <p class="font-bold">
                    No categories yet
                </p>

                <p class="mt-1 text-sm text-gray-500">
                    Add your first spending category above.
                </p>

            </div>

        `;

    }


    // ========================================
    // CATEGORY CARDS
    // ========================================

    budget.categories.forEach(
        (item) => {

            const card =
                document.createElement("div");


            card.className =
                "budget-card rounded-[2rem] bg-white p-4 shadow-sm";


            // --------------------------------
            // DONE STYLE
            // --------------------------------

            if (item.done) {

                card.classList.add(
                    "done-category"
                );

            }


            // --------------------------------
            // CARD HTML
            // --------------------------------

            card.innerHTML = `

                <div
                    class="flex items-center gap-3"
                    style="
                        border-left: 6px solid var(--user-color);
                        padding-left: 12px;
                    "
                >

                    <!-- CHECKBOX -->

                    <input
                        type="checkbox"
                        class="category-checkbox h-5 w-5 shrink-0 cursor-pointer"
                        ${item.done ? "checked" : ""}
                    >


                    <!-- EMOJI -->

                    <div
                        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF8F3] text-2xl"
                    >
                        ${escapeHtml(item.emoji || "✨")}
                    </div>


                    <!-- NAME -->

                    <div class="min-w-0 flex-1">

                        <p
                            class="category-name break-words font-bold leading-tight"
                        >
                            ${escapeHtml(item.name)}
                        </p>

                        <p class="text-xs text-gray-400">
                            Planned
                        </p>

                    </div>


                    <!-- AMOUNT -->

                    <div class="text-right">

                        <p class="font-black theme-text">
                            ${formatMoney(item.amount)}
                        </p>

                    </div>


                    <!-- EDIT -->

                    <button
                        type="button"
                        class="edit-category rounded-xl p-2 text-gray-400 transition hover:bg-[var(--user-light)] hover:text-[var(--user-color)]"
                        data-id="${item.id}"
                        title="Edit"
                        aria-label="Edit category"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <!-- DELETE -->

                    <button
                        type="button"
                        class="delete-category ml-1 rounded-xl p-2 text-red-400 transition hover:bg-red-50 hover:text-red-500"
                        data-id="${item.id}"
                        aria-label="Delete category"
                        title="Delete"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            `;


            // =================================
            // CHECKBOX
            // =================================

            const checkbox =
                card.querySelector(
                    ".category-checkbox"
                );


            checkbox.addEventListener(
                "change",
                () => {

                    item.done =
                        checkbox.checked;


                    saveBudgets();

                    renderBudget();

                }
            );


            // =================================
            // DELETE
            // =================================

            const deleteButton =
                card.querySelector(
                    ".delete-category"
                );


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteCategory(item.id);

                }
            );


            // =================================
            // EDIT
            // =================================

            const editButton =
                card.querySelector(
                    ".edit-category"
                );


            editButton.addEventListener(
                "click",
                () => {

                    openEditCategory(item.id);

                }
            );


            // --------------------------------
            // ADD CARD
            // --------------------------------

            budgetBody.appendChild(card);

        }
    );


    // ----------------------------------------
    // SELECTOR
    // ----------------------------------------

    renderBudgetSelector();


    // ----------------------------------------
    // SAVE
    // ----------------------------------------

    saveBudgets();

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;

}


// ============================================
// CREATE BUDGET
// ============================================

budgetForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // ------------------------------------
        // GET VALUES
        // ------------------------------------

        const titleInput =
            document.getElementById("title");

        const salaryInput =
            document.getElementById("salary");

        const monthInput =
            document.getElementById("monthPicker");

        const startDateInput =
            document.getElementById("startDate");

        const endDateInput =
            document.getElementById("endDate");


        const title =
            titleInput.value.trim();


        const income =
            Number(
                salaryInput.value
            );


        // ------------------------------------
        // VALIDATE TITLE
        // ------------------------------------

        if (!title) {

            alert(
                "Please enter a budget title."
            );

            titleInput.focus();

            return;

        }


        // ------------------------------------
        // VALIDATE INCOME
        // ------------------------------------

        if (
            salaryInput.value === "" ||
            isNaN(income) ||
            income < 0
        ) {

            alert(
                "Please enter a valid income."
            );

            salaryInput.focus();

            return;

        }


        // ------------------------------------
        // GENERATE SAFE ID
        // ------------------------------------

        const newId =
            generateId("budget");


        // ------------------------------------
        // CREATE BUDGET OBJECT
        // ------------------------------------

        const newBudget = {

            id:
                newId,

            type:
                budgetType.value,

            title:
                title,

            income:
                income,

            // =================================
            // IMPORTANT:
            // Each budget gets its OWN color.
            // =================================

            color:
                colorPicker.value ||
                DEFAULT_COLOR,

            categories:
                []

        };


        // ========================================
        // MONTHLY
        // ========================================

        if (
            newBudget.type === "monthly"
        ) {

            if (!monthInput.value) {

                alert(
                    "Please choose a month."
                );

                monthInput.focus();

                return;

            }


            newBudget.month =
                monthInput.value;

        }


        // ========================================
        // CUTOFF / CUSTOM
        // ========================================

        else {

            if (!startDateInput.value) {

                alert(
                    "Please choose a start date."
                );

                startDateInput.focus();

                return;

            }


            if (!endDateInput.value) {

                alert(
                    "Please choose an end date."
                );

                endDateInput.focus();

                return;

            }


            if (
                endDateInput.value <
                startDateInput.value
            ) {

                alert(
                    "End date cannot be before start date."
                );

                endDateInput.focus();

                return;

            }


            newBudget.startDate =
                startDateInput.value;


            newBudget.endDate =
                endDateInput.value;

        }


        // ========================================
        // ADD BUDGET
        // ========================================

        budgets.push(
            newBudget
        );


        activeBudgetId =
            newBudget.id;

        isCreatingBudget = false;

        // ========================================
        // SAVE
        // ========================================

        saveBudgets();


        // ========================================
        // SHOW BUDGET
        // ========================================

        showBudgetView();

        renderBudget();


        // ========================================
        // RESET FORM
        // ========================================

        budgetForm.reset();


        // Go back to Monthly after creating
        budgetType.value =
            "monthly";


        updateBudgetTypeFields();

        updateBudgetTypeButtons();

    }
);


// ============================================
// ADD CATEGORY
// ============================================

categoryForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const budget =
            getActiveBudget();


        if (!budget) {

            return;

        }


        const name =
            document
                .getElementById("category")
                .value
                .trim();


        const amount =
            Number(
                document
                    .getElementById("amount")
                    .value
            );


        if (!name) {

            alert(
                "Please enter a category name."
            );

            return;

        }


        if (
            isNaN(amount) ||
            amount < 0
        ) {

            alert(
                "Please enter a valid amount."
            );

            return;

        }


        // ------------------------------------
        // ADD NEW SEPARATE ENTRY
        // ------------------------------------

        budget.categories.push({

            id:
                generateId("category"),

            name:
                name,

            amount:
                amount,

            emoji:
                selectedEmoji.value ||
                "✨",

            done:
                false

        });


        // ------------------------------------
        // RESET CATEGORY FORM
        // ------------------------------------

        categoryForm.reset();


        selectedEmoji.value =
            "✨";


        resetEmojiButtons();


        saveBudgets();

        renderBudget();

    }
);


// ============================================
// ADD CATEGORY EMOJI BUTTONS
// ============================================

document
    .querySelectorAll(".emojiBtn")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                selectedEmoji.value =
                    button.dataset.emoji;


                resetEmojiButtons();


                button.classList.add(
                    "ring-2",
                    "ring-[var(--user-color)]"
                );

            }
        );

    });


function resetEmojiButtons() {

    document
        .querySelectorAll(".emojiBtn")
        .forEach((button) => {

            button.classList.remove(
                "ring-2",
                "ring-[var(--user-color)]"
            );

        });

}


// ============================================
// OPEN EDIT CATEGORY
// ============================================

function openEditCategory(itemId) {

    const budget =
        getActiveBudget();


    if (!budget) {

        return;

    }


    // ----------------------------------------
    // FIND EXACT CATEGORY BY ID
    // ----------------------------------------

    const item =
        budget.categories.find(
            (category) =>
                category.id === itemId
        );


    if (!item) {

        alert(
            "Sorry, this category could not be found."
        );

        return;

    }


    // ----------------------------------------
    // STORE EDITING ID
    // ----------------------------------------

    editingCategoryId =
        item.id;


    // ----------------------------------------
    // FILL FORM
    // ----------------------------------------

    editCategoryName.value =
        item.name;


    editCategoryAmount.value =
        item.amount;


    editSelectedEmoji.value =
        item.emoji || "✨";


    updateEditEmojiButtons();


    // ----------------------------------------
    // SHOW MODAL
    // ----------------------------------------

    editModal.classList.remove(
        "hidden"
    );


    editModal.classList.add(
        "flex"
    );


    // ----------------------------------------
    // FOCUS NAME
    // ----------------------------------------

    setTimeout(
        () => {

            editCategoryName.focus();

            editCategoryName.select();

        },
        50
    );

}


// ============================================
// CLOSE EDIT MODAL
// ============================================

function closeEditCategory() {

    editingCategoryId =
        null;


    editCategoryForm.reset();


    editSelectedEmoji.value =
        "✨";


    updateEditEmojiButtons();


    editModal.classList.add(
        "hidden"
    );


    editModal.classList.remove(
        "flex"
    );

}


// ============================================
// EDIT EMOJI BUTTONS
// ============================================

document
    .querySelectorAll(".editEmojiBtn")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                editSelectedEmoji.value =
                    button.dataset.emoji;


                updateEditEmojiButtons();

            }
        );

    });


function updateEditEmojiButtons() {

    document
        .querySelectorAll(".editEmojiBtn")
        .forEach((button) => {

            const isSelected =
                button.dataset.emoji ===
                editSelectedEmoji.value;


            if (isSelected) {

                button.classList.add(
                    "ring-2",
                    "ring-[var(--user-color)]"
                );

            } else {

                button.classList.remove(
                    "ring-2",
                    "ring-[var(--user-color)]"
                );

            }

        });

}


// ============================================
// SAVE EDITED CATEGORY
// ============================================

editCategoryForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const budget =
            getActiveBudget();


        if (!budget) {

            return;

        }


        if (!editingCategoryId) {

            return;

        }


        // ------------------------------------
        // FIND EXACT ITEM BY ID
        // ------------------------------------

        const item =
            budget.categories.find(
                (category) =>
                    category.id ===
                    editingCategoryId
            );


        if (!item) {

            alert(
                "Sorry, this category could not be found."
            );

            closeEditCategory();

            return;

        }


        // ------------------------------------
        // GET NEW VALUES
        // ------------------------------------

        const newName =
            editCategoryName.value.trim();


        const newAmount =
            Number(
                editCategoryAmount.value
            );


        const newEmoji =
            editSelectedEmoji.value ||
            "✨";


        // ------------------------------------
        // VALIDATE NAME
        // ------------------------------------

        if (!newName) {

            alert(
                "Please enter a category name."
            );

            editCategoryName.focus();

            return;

        }


        // ------------------------------------
        // VALIDATE AMOUNT
        // ------------------------------------

        if (
            isNaN(newAmount) ||
            newAmount < 0
        ) {

            alert(
                "Please enter a valid amount."
            );

            editCategoryAmount.focus();

            return;

        }


        // ------------------------------------
        // UPDATE EXACT ITEM
        // ------------------------------------

        item.name =
            newName;


        item.amount =
            newAmount;


        item.emoji =
            newEmoji;


        // ------------------------------------
        // SAVE
        // ------------------------------------

        saveBudgets();


        // ------------------------------------
        // CLOSE
        // ------------------------------------

        closeEditCategory();


        // ------------------------------------
        // REFRESH
        // ------------------------------------

        renderBudget();

    }
);


// ============================================
// CANCEL EDIT
// ============================================

cancelEditBtn.addEventListener(
    "click",
    closeEditCategory
);


closeEditModalBtn.addEventListener(
    "click",
    closeEditCategory
);


// ============================================
// CLOSE EDIT WHEN CLICKING BACKDROP
// ============================================

editModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            editModal
        ) {

            closeEditCategory();

        }

    }
);


// ============================================
// ESC KEY CLOSES EDIT
// ============================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            !editModal.classList.contains("hidden")
        ) {

            closeEditCategory();

        }

    }
);


// ============================================
// DELETE CATEGORY
// ============================================

function deleteCategory(itemId) {

    const budget =
        getActiveBudget();


    if (!budget) {

        return;

    }


    // ----------------------------------------
    // FIND EXACT CATEGORY
    // ----------------------------------------

    const item =
        budget.categories.find(
            (category) =>
                category.id === itemId
        );


    if (!item) {

        return;

    }


    const shouldDelete =
        confirm(
            `Delete "${item.name}"?`
        );


    if (!shouldDelete) {

        return;

    }


    // ----------------------------------------
    // REMOVE ONLY THIS EXACT ITEM
    // ----------------------------------------

    budget.categories =
        budget.categories.filter(
            (category) =>
                category.id !== itemId
        );


    saveBudgets();

    renderBudget();

}


// ============================================
// NEW BUDGET
// ============================================

newBudgetBtn.addEventListener(
    "click",
    () => {

        // We are now creating a NEW budget.
        isCreatingBudget = true;


        showBudgetSetup();


        budgetForm.reset();


        budgetType.value =
            "monthly";


        updateBudgetTypeFields();

        updateBudgetTypeButtons();


        // ----------------------------------------
        // Give the new budget a fresh color choice
        // ----------------------------------------

        colorPicker.value =
            DEFAULT_COLOR;

        applyTheme(
            DEFAULT_COLOR
        );

    }
);


// ============================================
// CANCEL NEW BUDGET
// ============================================

cancelBudgetBtn.addEventListener(
    "click",
    () => {

        // We are leaving the new-budget screen
        isCreatingBudget = false;


        const budget =
            getActiveBudget();


        if (!budget) {

            return;

        }


        showBudgetView();


        budgetForm.reset();


        budgetType.value =
            "monthly";


        updateBudgetTypeFields();

        updateBudgetTypeButtons();


        renderBudget();

    }
);


// ============================================
// DELETE BUDGET
// ============================================

deleteBudgetBtn.addEventListener(
    "click",
    () => {

        const budget =
            getActiveBudget();


        if (!budget) {

            return;

        }


        const shouldDelete =
            confirm(
                `Delete "${budget.title}"?\n\nThis cannot be undone.`
            );


        if (!shouldDelete) {

            return;

        }


        // ------------------------------------
        // REMOVE CURRENT BUDGET
        // ------------------------------------

        budgets =
            budgets.filter(
                (item) =>
                    item.id !==
                    activeBudgetId
            );


        // ------------------------------------
        // OTHER BUDGETS EXIST
        // ------------------------------------

        if (
            budgets.length > 0
        ) {

            activeBudgetId =
                budgets[
                    budgets.length - 1
                ].id;


            saveBudgets();

            renderBudget();

            return;

        }


        // ------------------------------------
        // NO BUDGETS LEFT
        // ------------------------------------

        activeBudgetId =
            null;


        localStorage.removeItem(
            "budgets"
        );


        localStorage.removeItem(
            "activeBudgetId"
        );


        budgetSection.classList.add(
            "hidden"
        );


        budgetSetupArea.classList.remove(
            "hidden"
        );


        budgetForm.reset();


        budgetType.value =
            "monthly";


        updateBudgetTypeFields();

        updateBudgetTypeButtons();


        cancelBudgetBtn.classList.add(
            "hidden"
        );


        // Reset to default appearance
        colorPicker.value =
            DEFAULT_COLOR;

        applyTheme(
            DEFAULT_COLOR
        );

    }
);


// ============================================
// SWITCH BUDGET
// ============================================

document
    .getElementById("budgetSelector")
    .addEventListener(
        "change",
        (event) => {

            activeBudgetId =
                event.target.value;


            saveBudgets();

            renderBudget();

        }
    );


// ============================================
// CURRENCY CHANGE
// ============================================

currencySelect.addEventListener(
    "change",
    () => {

        localStorage.setItem(
            "currency",
            currencySelect.value
        );


        renderBudget();

    }
);


// ============================================
// COLOR
// ============================================

colorPicker.addEventListener(
    "input",
    (event) => {

        const chosenColor =
            event.target.value;


        // Always change the visual theme immediately
        applyTheme(
            chosenColor
        );


        // ----------------------------------------
        // IMPORTANT
        // ----------------------------------------
        //
        // If we're creating a NEW budget,
        // do NOT change the currently active
        // existing budget.
        //
        if (isCreatingBudget) {

            return;

        }


        // ----------------------------------------
        // Otherwise, save the color to the
        // currently selected budget.
        // ----------------------------------------

        const budget =
            getActiveBudget();


        if (budget) {

            budget.color =
                chosenColor;

            saveBudgets();

        }

    }
);


// ============================================
// APPLY THEME
// ============================================

function applyTheme(color) {

    document.documentElement.style
        .setProperty(
            "--user-color",
            color
        );


    const lightColor =
        lightenColor(
            color,
            88
        );


    document.documentElement.style
        .setProperty(
            "--user-light",
            lightColor
        );


    const textColor =
        getContrastColor(
            color
        );


    document.documentElement.style
        .setProperty(
            "--user-text-color",
            textColor
        );

}


// ============================================
// LIGHTEN COLOR
// ============================================

function lightenColor(
    hex,
    amount
) {

    let color =
        hex.replace(
            "#",
            ""
        );


    if (
        color.length === 3
    ) {

        color =
            color
                .split("")
                .map(
                    (c) =>
                        c + c
                )
                .join("");

    }


    const r =
        parseInt(
            color.substring(0, 2),
            16
        );


    const g =
        parseInt(
            color.substring(2, 4),
            16
        );


    const b =
        parseInt(
            color.substring(4, 6),
            16
        );


    const newR =
        Math.round(
            r +
            (255 - r) *
            (amount / 100)
        );


    const newG =
        Math.round(
            g +
            (255 - g) *
            (amount / 100)
        );


    const newB =
        Math.round(
            b +
            (255 - b) *
            (amount / 100)
        );


    return `rgb(${newR}, ${newG}, ${newB})`;

}


// ============================================
// CONTRAST COLOR
// ============================================

function getContrastColor(hex) {

    let color =
        hex.replace(
            "#",
            ""
        );


    if (
        color.length === 3
    ) {

        color =
            color
                .split("")
                .map(
                    (c) =>
                        c + c
                )
                .join("");

    }


    const r =
        parseInt(
            color.substring(0, 2),
            16
        );


    const g =
        parseInt(
            color.substring(2, 4),
            16
        );


    const b =
        parseInt(
            color.substring(4, 6),
            16
        );


    const brightness =
        (
            r * 299 +
            g * 587 +
            b * 114
        ) / 1000;


    return brightness > 155
        ? "#1f2937"
        : "#ffffff";

}


// ============================================
// LOAD SAVED DATA
// ============================================

window.addEventListener(
    "load",
    () => {

        // ------------------------------------
        // CURRENCY
        // ------------------------------------

        const savedCurrency =
            localStorage.getItem(
                "currency"
            );


        if (savedCurrency) {

            currencySelect.value =
                savedCurrency;

        }


        // ------------------------------------
        // BUDGETS
        // ------------------------------------

        const savedBudgets =
            localStorage.getItem(
                "budgets"
            );


        const savedActiveBudgetId =
            localStorage.getItem(
                "activeBudgetId"
            );


        if (savedBudgets) {

            try {

                budgets =
                    JSON.parse(
                        savedBudgets
                    );


                // =================================
                // MIGRATE OLD DATA
                // =================================

                budgets.forEach(
                    (budget) => {

                        // --------------------------------
                        // BUDGET COLOR
                        // --------------------------------
                        //
                        // IMPORTANT:
                        // Do NOT use colorPicker.value here.
                        // That would make old budgets inherit
                        // the last selected color.
                        //
                        // --------------------------------

                        if (!budget.color) {

                            budget.color =
                                DEFAULT_COLOR;

                        }


                        // --------------------------------
                        // CATEGORIES
                        // --------------------------------

                        if (
                            !Array.isArray(
                                budget.categories
                            )
                        ) {

                            budget.categories =
                                [];

                        }


                        budget.categories =
                            budget.categories.map(
                                (item) => ({

                                    id:
                                        item.id ||
                                        generateId(
                                            "category"
                                        ),

                                    name:
                                        item.name ||
                                        "",

                                    amount:
                                        Number(
                                            item.amount
                                        ) || 0,

                                    emoji:
                                        item.emoji ||
                                        "✨",

                                    done:
                                        Boolean(
                                            item.done
                                        )

                                })
                            );

                    }
                );


                // --------------------------------
                // FIND ACTIVE BUDGET
                // --------------------------------

                const budgetStillExists =
                    budgets.some(
                        (budget) =>
                            budget.id ===
                            savedActiveBudgetId
                    );


                if (
                    budgetStillExists
                ) {

                    activeBudgetId =
                        savedActiveBudgetId;

                } else {

                    activeBudgetId =
                        budgets[0]?.id ||
                        null;

                }


                // Save migrated data
                saveBudgets();

            } catch (error) {

                console.error(
                    "Could not load budgets:",
                    error
                );


                budgets = [];

                activeBudgetId = null;

            }

        }


        // ------------------------------------
        // SHOW CORRECT SCREEN
        // ------------------------------------

        if (
            budgets.length > 0
        ) {

            showBudgetView();

            renderBudget();

        } else {

            showBudgetSetup();

            cancelBudgetBtn.classList.add(
                "hidden"
            );


            // Default color for fresh app
            colorPicker.value =
                DEFAULT_COLOR;

            applyTheme(
                DEFAULT_COLOR
            );

        }

    }
);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}
