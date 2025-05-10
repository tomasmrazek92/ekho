function runFs() {
  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      if (!listInstances?.length) return;

      const listInstance = listInstances[0];
      const currentPath = window.location.pathname.replace(/^\//, '');

      listInstance.effect(() => {
        const items = listInstance.items.value;
        if (!items?.length) return;

        const processNestedItems = () => {
          // Collect fields for items
          items.forEach((item) => {
            if (typeof item.collectFields === 'function') {
              item.collectFields();
            }
          });

          // Filter and hide non-matching items
          const filteredItems = items.filter((item) => {
            const blockField = item.fields?.['building-block'];
            if (!blockField) {
              item.element && (item.element.style.display = 'none');
              return false;
            }

            const blockValue = String(blockField.value);
            const isMatch = blockValue.includes(currentPath) || currentPath.includes(blockValue);

            if (!isMatch && item.element) {
              item.element.style.display = 'none';
            }

            return isMatch;
          });

          // Direct DOM filtering for any items that might have been missed
          listInstance.listElement.querySelectorAll('.w-dyn-item').forEach((element) => {
            const blockField = element.querySelector('[fs-list-field="building-block"]');
            if (!blockField) {
              element.style.display = 'none';
              return;
            }

            const fieldValue = blockField.textContent.trim();
            element.style.display =
              fieldValue.includes(currentPath) || currentPath.includes(fieldValue) ? '' : 'none';
          });

          // Update list items if changed
          if (filteredItems.length !== items.length) {
            listInstance.items.value = filteredItems;
          }
        };

        // Handle nesting
        const itemsWithNesting = items.filter((item) => item.nesting instanceof Promise);

        if (itemsWithNesting.length) {
          Promise.all(itemsWithNesting.map((item) => item.nesting))
            .then(processNestedItems)
            .catch((err) => console.error('Nesting error:', err));
        } else {
          processNestedItems();
        }
      });
    },
  ]);
}

$(document).ready(runFs);
