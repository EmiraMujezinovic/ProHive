using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

public partial class ProHiveContext : DbContext
{
    public ProHiveContext()
    {
    }

    public ProHiveContext(DbContextOptions<ProHiveContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ApplicationStatus> ApplicationStatuses { get; set; }

    public virtual DbSet<ClientProfile> ClientProfiles { get; set; }

    public virtual DbSet<Favorite> Favorites { get; set; }

    public virtual DbSet<FreelancerProfile> FreelancerProfiles { get; set; }

    public virtual DbSet<FreelancerSkill> FreelancerSkills { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderStatus> OrderStatuses { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PaymentStatus> PaymentStatuses { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<ProjectApplication> ProjectApplications { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<ServiceCategory> ServiceCategories { get; set; }

    public virtual DbSet<ServiceTag> ServiceTags { get; set; }

    public virtual DbSet<Skill> Skills { get; set; }

    public virtual DbSet<Tag> Tags { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=LAPTOP-KVQSN50M\\SQLEXPRESS;Database=ProHive;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApplicationStatus>(entity =>
        {
            entity.ToTable("ApplicationStatus");

            entity.Property(e => e.ApplicationStatusId).HasColumnName("applicationStatusID");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
        });

        modelBuilder.Entity<ClientProfile>(entity =>
        {
            entity.ToTable("ClientProfile");

            entity.Property(e => e.ClientProfileId).HasColumnName("clientProfileID");
            entity.Property(e => e.CompanyName)
                .HasMaxLength(50)
                .HasColumnName("companyName");
            entity.Property(e => e.Description)
                .HasMaxLength(150)
                .HasColumnName("description");
            entity.Property(e => e.JobTitle)
                .HasMaxLength(50)
                .HasColumnName("jobTitle");
            entity.Property(e => e.Location)
                .HasMaxLength(255)
                .HasColumnName("location");
            entity.Property(e => e.UserId).HasColumnName("userID");

            entity.HasOne(d => d.User).WithMany(p => p.ClientProfiles)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_ClientProfile_Users");
        });

        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.Property(e => e.FavoriteId).HasColumnName("favoriteID");
            entity.Property(e => e.ServiceId).HasColumnName("serviceID");
            entity.Property(e => e.UserId).HasColumnName("userID");

            entity.HasOne(d => d.Service).WithMany(p => p.Favorites)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Favorites_Services");

            entity.HasOne(d => d.User).WithMany(p => p.Favorites)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Favorites_Users");
        });

        modelBuilder.Entity<FreelancerProfile>(entity =>
        {
            entity.ToTable("FreelancerProfile");

            entity.Property(e => e.FreelancerProfileId).HasColumnName("freelancerProfileID");
            entity.Property(e => e.Bio)
                .HasMaxLength(500)
                .HasColumnName("bio");
            entity.Property(e => e.ExperianceLevel)
                .HasMaxLength(50)
                .HasColumnName("experianceLevel");
            entity.Property(e => e.Location)
                .HasMaxLength(255)
                .HasColumnName("location");
            entity.Property(e => e.UserId).HasColumnName("userID");

            entity.HasOne(d => d.User).WithMany(p => p.FreelancerProfiles)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_FreelancerProfile_Users");
        });

        modelBuilder.Entity<FreelancerSkill>(entity =>
        {
            entity.HasKey(e => e.FreelancerSkillsId);

            entity.Property(e => e.FreelancerSkillsId).HasColumnName("freelancerSkillsID");
            entity.Property(e => e.FreelancerProfileId).HasColumnName("freelancerProfileID");
            entity.Property(e => e.SkillId).HasColumnName("skillID");

            entity.HasOne(d => d.FreelancerProfile).WithMany(p => p.FreelancerSkills)
                .HasForeignKey(d => d.FreelancerProfileId)
                .HasConstraintName("FK_FreelancerSkills_FreelancerProfile");

            entity.HasOne(d => d.Skill).WithMany(p => p.FreelancerSkills)
                .HasForeignKey(d => d.SkillId)
                .HasConstraintName("FK_FreelancerSkills_Skills");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(e => e.OrderId).HasColumnName("orderID");
            entity.Property(e => e.ClientProfileId).HasColumnName("clientProfileID");
            entity.Property(e => e.DueDate).HasColumnName("dueDate");
            entity.Property(e => e.OrderStatusId).HasColumnName("orderStatusID");
            entity.Property(e => e.ServiceId).HasColumnName("serviceID");

            entity.HasOne(d => d.ClientProfile).WithMany(p => p.Orders)
                .HasForeignKey(d => d.ClientProfileId)
                .HasConstraintName("FK_Orders_ClientProfile");

            entity.HasOne(d => d.OrderStatus).WithMany(p => p.Orders)
                .HasForeignKey(d => d.OrderStatusId)
                .HasConstraintName("FK_Orders_OrderStatus");

            entity.HasOne(d => d.Service).WithMany(p => p.Orders)
                .HasForeignKey(d => d.ServiceId)
                .HasConstraintName("FK_Orders_Services");
        });

        modelBuilder.Entity<OrderStatus>(entity =>
        {
            entity.ToTable("OrderStatus");

            entity.Property(e => e.OrderStatusId).HasColumnName("orderStatusID");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.Property(e => e.PaymentId).HasColumnName("paymentID");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.ApplicationId).HasColumnName("applicationID");
            entity.Property(e => e.OrderId).HasColumnName("orderID");
            entity.Property(e => e.PaymentDate).HasColumnName("paymentDate");
            entity.Property(e => e.PaymentStatusId).HasColumnName("paymentStatusID");

            entity.HasOne(d => d.Application).WithMany(p => p.Payments)
                .HasForeignKey(d => d.ApplicationId)
                .HasConstraintName("FK_Payments_ProjectApplications");

            entity.HasOne(d => d.Order).WithMany(p => p.Payments)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Payments_Orders");

            entity.HasOne(d => d.PaymentStatus).WithMany(p => p.Payments)
                .HasForeignKey(d => d.PaymentStatusId)
                .HasConstraintName("FK_Payments_PaymentStatus");
        });

        modelBuilder.Entity<PaymentStatus>(entity =>
        {
            entity.ToTable("PaymentStatus");

            entity.Property(e => e.PaymentStatusId).HasColumnName("paymentStatusID");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.Property(e => e.ProjectId).HasColumnName("projectID");
            entity.Property(e => e.Budget)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("budget");
            entity.Property(e => e.ClientProfileId).HasColumnName("clientProfileID");
            entity.Property(e => e.Deadline).HasColumnName("deadline");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .HasColumnName("title");

            entity.HasOne(d => d.ClientProfile).WithMany(p => p.Projects)
                .HasForeignKey(d => d.ClientProfileId)
                .HasConstraintName("FK_Projects_ClientProfile");
        });

        modelBuilder.Entity<ProjectApplication>(entity =>
        {
            entity.HasKey(e => e.ApplicationId);

            entity.Property(e => e.ApplicationId).HasColumnName("applicationID");
            entity.Property(e => e.ApplicationStatusId).HasColumnName("applicationStatusID");
            entity.Property(e => e.FreelancerProfileId).HasColumnName("freelancerProfileID");
            entity.Property(e => e.ProjectId).HasColumnName("projectID");
            entity.Property(e => e.Proposal)
                .HasMaxLength(255)
                .HasColumnName("proposal");

            entity.HasOne(d => d.ApplicationStatus).WithMany(p => p.ProjectApplications)
                .HasForeignKey(d => d.ApplicationStatusId)
                .HasConstraintName("FK_ProjectApplications_ApplicationStatus");

            entity.HasOne(d => d.FreelancerProfile).WithMany(p => p.ProjectApplications)
                .HasForeignKey(d => d.FreelancerProfileId)
                .HasConstraintName("FK_ProjectApplications_FreelancerProfile");

            entity.HasOne(d => d.Project).WithMany(p => p.ProjectApplications)
                .HasForeignKey(d => d.ProjectId)
                .HasConstraintName("FK_ProjectApplications_Projects");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.Property(e => e.ReviewId).HasColumnName("reviewID");
            entity.Property(e => e.Comment)
                .HasMaxLength(100)
                .HasColumnName("comment");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.RevieweeId).HasColumnName("revieweeID");
            entity.Property(e => e.ReviewerId).HasColumnName("reviewerID");

            entity.HasOne(d => d.Reviewee).WithMany(p => p.ReviewReviewees)
                .HasForeignKey(d => d.RevieweeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reviews_Users1");

            entity.HasOne(d => d.Reviewer).WithMany(p => p.ReviewReviewers)
                .HasForeignKey(d => d.ReviewerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reviews_Users");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.Property(e => e.RoleId).HasColumnName("roleID");
            entity.Property(e => e.Role1)
                .HasMaxLength(50)
                .HasColumnName("role");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.Property(e => e.ServiceId).HasColumnName("serviceID");
            entity.Property(e => e.Description)
                .HasMaxLength(300)
                .HasColumnName("description");
            entity.Property(e => e.DurationInDays).HasColumnName("durationInDays");
            entity.Property(e => e.FreelancerProfileId).HasColumnName("freelancerProfileID");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price");
            entity.Property(e => e.ServiceCategoryId).HasColumnName("serviceCategoryID");
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .HasColumnName("title");

            entity.HasOne(d => d.FreelancerProfile).WithMany(p => p.Services)
                .HasForeignKey(d => d.FreelancerProfileId)
                .HasConstraintName("FK_Services_FreelancerProfile");

            entity.HasOne(d => d.ServiceCategory).WithMany(p => p.Services)
                .HasForeignKey(d => d.ServiceCategoryId)
                .HasConstraintName("FK_Services_ServiceCategories");
        });

        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.Property(e => e.ServiceCategoryId).HasColumnName("serviceCategoryID");
            entity.Property(e => e.Service)
                .HasMaxLength(255)
                .HasColumnName("service");
        });

        modelBuilder.Entity<ServiceTag>(entity =>
        {
            entity.Property(e => e.ServiceTagId).HasColumnName("serviceTagID");
            entity.Property(e => e.ServiceId).HasColumnName("serviceID");
            entity.Property(e => e.TagId).HasColumnName("tagID");

            entity.HasOne(d => d.Service).WithMany(p => p.ServiceTags)
                .HasForeignKey(d => d.ServiceId)
                .HasConstraintName("FK_ServiceTags_Services");

            entity.HasOne(d => d.Tag).WithMany(p => p.ServiceTags)
                .HasForeignKey(d => d.TagId)
                .HasConstraintName("FK_ServiceTags_Tags");
        });

        modelBuilder.Entity<Skill>(entity =>
        {
            entity.Property(e => e.SkillId).HasColumnName("skillID");
            entity.Property(e => e.Skill1)
                .HasMaxLength(255)
                .HasColumnName("skill");
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.Property(e => e.TagId).HasColumnName("tagID");
            entity.Property(e => e.Tag1)
                .HasMaxLength(50)
                .HasColumnName("tag");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.UserId).HasColumnName("userID");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("fullName");
            entity.Property(e => e.PasswordHash).HasColumnName("passwordHash");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(50)
                .HasColumnName("phoneNumber");
            entity.Property(e => e.ProfileImageUrl)
                .HasMaxLength(255)
                .HasColumnName("profileImageURL");
            entity.Property(e => e.RoleId).HasColumnName("roleID");
            entity.Property(e => e.Username)
                .HasMaxLength(100)
                .HasColumnName("username");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.Property(e => e.UserRoleId).HasColumnName("userRoleID");
            entity.Property(e => e.IsPrimary).HasColumnName("isPrimary");
            entity.Property(e => e.RoleId).HasColumnName("roleID");
            entity.Property(e => e.UserId).HasColumnName("userID");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK_UserRoles_Roles");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_UserRoles_Users");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
