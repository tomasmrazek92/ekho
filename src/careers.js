let url = 'https://api.ashbyhq.com/posting-api/job-board/Ekho';

if (window.location.pathname === '/careers') {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      let roles = data.jobs;
      console.log(roles);

      let uniqueCommitments = [];
      let uniqueTeams = [];
      let uniqueLocations = [];
      let jobsByTeam = {};

      roles.forEach(function (role) {
        if (role.employmentType && !uniqueCommitments.includes(role.employmentType)) {
          uniqueCommitments.push(role.employmentType);
        }

        if (role.team) {
          const { team } = role;
          console.log(team);

          if (!uniqueTeams.includes(team)) {
            uniqueTeams.push(team);
          }

          if (!jobsByTeam[team]) {
            jobsByTeam[team] = [];
          }
          jobsByTeam[team].push(role);
        }

        if (role.location && !uniqueLocations.includes(role.location)) {
          uniqueLocations.push(role.location);
        }
      });

      updateDropdown('[data-dropdown-location]', uniqueLocations, 'All');
      updateDropdown('[data-dropdown-team]', uniqueTeams, 'All');
      updateDropdown('[data-dropdown-worktype]', uniqueCommitments, 'All');

      function updateDropdown(selector, options, allText) {
        const dropdown = $(selector);
        if (dropdown.length) {
          const listInner = dropdown.find('.filter-dropdown_list-inner');
          listInner.empty();

          listInner.append(
            `<a href="#" class="filter-dropdown_list-link w-inline-block active" data-value="all"><div>${allText}</div></a>`
          );

          options.forEach(function (option) {
            listInner.append(
              `<a href="#" class="filter-dropdown_list-link w-inline-block" data-value="${option}"><div>${option}</div></a>`
            );
          });

          listInner
            .find('.filter-dropdown_list-link')
            .off('click')
            .on('click', function (e) {
              e.preventDefault();

              $(this)
                .closest('.filter-dropdown_list-inner')
                .find('.filter-dropdown_list-link')
                .removeClass('active');

              $(this).addClass('active');

              applyFilters();
            });
        }
      }

      const filterManager = {
        getActiveFilters: function () {
          const locationFilter = $('[data-dropdown-location] .filter-dropdown_list-link.active');
          const teamFilter = $('[data-dropdown-team] .filter-dropdown_list-link.active');
          const worktypeFilter = $('[data-dropdown-worktype] .filter-dropdown_list-link.active');

          return {
            location: locationFilter.length ? locationFilter.data('value') : 'all',
            team: teamFilter.length ? teamFilter.data('value') : 'all',
            commitment: worktypeFilter.length ? worktypeFilter.data('value') : 'all',
          };
        },

        matchesFilters: function (item, filters) {
          const $item = $(item);

          if (filters.location !== 'all') {
            const itemLocation = $item.attr('data-location');
            if (!itemLocation || !itemLocation.includes(filters.location)) {
              return false;
            }
          }

          if (filters.team !== 'all') {
            const itemTeam = $item.attr('data-team');
            if (!itemTeam || itemTeam !== filters.team) {
              return false;
            }
          }

          if (filters.commitment !== 'all') {
            const itemCommitment = $item.attr('data-commitment');
            if (!itemCommitment || itemCommitment !== filters.commitment) {
              return false;
            }
          }

          return true;
        },
      };

      function applyFilters() {
        const filters = filterManager.getActiveFilters();
        let visibleJobsCount = 0;
        const jobItems = $('[data-roles="item"]');
        const teamSections = $('[data-roles="part"]');

        jobItems.show();
        teamSections.show();

        const allFiltersAreAll =
          filters.location === 'all' && filters.team === 'all' && filters.commitment === 'all';

        if (allFiltersAreAll) {
          visibleJobsCount = jobItems.length;
        } else {
          jobItems.each(function () {
            const $this = $(this);
            if (filterManager.matchesFilters(this, filters)) {
              $this.show();
              visibleJobsCount++;
            } else {
              $this.hide();
            }
          });

          teamSections.each(function () {
            const teamSection = $(this);
            const visibleItems = teamSection.find('[data-roles="item"]:visible').length;

            if (visibleItems === 0) {
              teamSection.hide();
            } else {
              teamSection.show();
            }
          });
        }

        $('[roles-counter]').text(visibleJobsCount);
      }

      const rolesContainer = $('.careers-roles_list');
      const teamPartTemplate = $('[data-roles="part"]:first').clone();
      const roleItemTemplate = $('[data-roles="item"]:first').clone();

      rolesContainer.empty();

      console.log(uniqueTeams);
      uniqueTeams.forEach(function (team) {
        if (!jobsByTeam[team] || jobsByTeam[team].length === 0) return;

        const teamSection = teamPartTemplate.clone();
        teamSection.find('[data-roles="team-title"]').text(team);

        const teamList = teamSection.find('[data-roles="team-list"]');
        teamList.empty();

        jobsByTeam[team].forEach(function (job) {
          const jobItem = roleItemTemplate.clone();

          jobItem.find('[data-roles="item-title"]').text(job.title);
          jobItem.find('[data-roles="item-location"]').text(job.location);
          jobItem.find('[data-roles="item-commitment"]').text(job.employmentType || '');

          jobItem.attr('href', job.jobUrl);
          jobItem.attr('data-commitment', job.employmentType || '');
          jobItem.attr('data-team', team);
          jobItem.attr('data-location', job.location);

          teamList.append(jobItem);
        });

        rolesContainer.append(teamSection);
      });

      $('.careers-roles_loading').hide();
      $('.careers-roles_part').show();

      applyFilters();
    })
    .catch((error) => console.error('Error fetching data:', error));
}
