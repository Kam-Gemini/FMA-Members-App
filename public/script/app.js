<h1>All Profiles</h1>
            <ul>
                <% allMembers.forEach((member) => { %>
                <li>
                    <a href="/members/<%= member._id %>">
                    <%= member.name %></a>
                </li>
                <% }) %>
            </ul>
            <% if (isLoggedIn) { %>
                <button onclick="window.location.href='/members/new'">Create Profile</button>
            <% } else { %>
                <p>Please log in to create a profile.</p>
            <% } %>

module.exports = app; // Export the app
